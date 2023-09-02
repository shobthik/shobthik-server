import User, { EUserRole } from "../../entities/user/User";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UnauthorizedError,
} from "type-graphql";
import { ClientProfile } from "../../entities/user/ClientProfile";
import { IGraphqlContext } from "../../types/types";
import { Connection } from "typeorm";
import { ApolloError, UserInputError } from "apollo-server-express";
import BaseUserProfile from "../../entities/user/BaseUserProfile";
import VolunteerProfile from "../../entities/user/VolunteerProfile";
import TherapistProfile from "../../entities/user/TherapistProfile";
import VolunteerProfileInput from "../input/VolunteerProfileInput";
import ClientProfileInput from "../input/ClientProfileInput";
import TherapistProfileInput from "../input/TherapistProfileInput";
import ProfileQueryResult from "../custom/MeQueryResult";
import ExperienceInput from "../input/ExperienceInput";
import EducationInput from "../input/EducationInput";
import Experience from "../../entities/qualifications/Experience";
import Education from "../../entities/qualifications/Education";
import ProfileUpdateInput from "../input/ProfileUpateInput";

const isExperienceData = (
  data: ExperienceInput | EducationInput,
): data is ExperienceInput => {
  // for Experience, description is a required field
  // for Education, description field does not exist
  return (data as ExperienceInput).description !== undefined;
};

@Resolver()
export default class UserResolver {
  async createEducationOrExperience<T extends ExperienceInput | EducationInput>(
    data: T,
    user: BaseUserProfile,
  ) {
    if (isExperienceData(data)) {
      await Experience.create({
        ...data,
        user,
      }).save();
    } else {
      await Education.create({
        ...data,
        user,
      }).save();
    }
  }

  async createProfile(
    inputData:
      | ClientProfileInput
      | VolunteerProfileInput
      | TherapistProfileInput,
    dbConnection: Connection,
    authenticatedUser: User,
    targetUserType: EUserRole,
  ): Promise<BaseUserProfile> {
    return await dbConnection.transaction(
      async (transactionalEntityManager) => {
        try {
          const userUpdateResults = await transactionalEntityManager.update(
            User,
            authenticatedUser?.id!,
            { isNewUser: false, userRole: targetUserType, isApproved: false },
          );

          if (userUpdateResults.affected !== 1) {
            throw new ApolloError("User could not be updated");
          }

          let profile = transactionalEntityManager.create(BaseUserProfile, {
            firstName: inputData.firstName,
            lastName: inputData.lastName,
            gender: inputData.gender,
            dateOfBirth: inputData.dateOfBirth,
            user: authenticatedUser,
          });

          await BaseUserProfile.save(profile); // do this without the transaction entity manager

          switch (targetUserType) {
            case EUserRole.CLIENT: {
              // clients are approved by default
              await transactionalEntityManager.update(
                User,
                authenticatedUser?.id!,
                { isApproved: true },
              );

              const castedInputData = inputData as ClientProfileInput;

              const clientProfile = transactionalEntityManager.create(
                ClientProfile,
                {
                  currentEmploymentStatus:
                    castedInputData.currentEmploymentStatus,
                  primaryIssue: castedInputData.primaryIssue,
                  consultedPsychiatrist: castedInputData.consultedPsychiatrist,
                  baseUserProfile: profile,
                },
              );

              await ClientProfile.save(clientProfile);

              return profile;
            }

            case EUserRole.VOLUNTEER: {
              const castedInputData = inputData as VolunteerProfileInput;

              const volunteerProfile = transactionalEntityManager.create(
                VolunteerProfile,
                {
                  baseUserProfile: profile,
                },
              );

              await VolunteerProfile.save(volunteerProfile);

              if (
                castedInputData.experience &&
                castedInputData.experience.length > 0
              ) {
                castedInputData.experience.forEach((experienceData) => {
                  this.createEducationOrExperience<ExperienceInput>(
                    experienceData,
                    profile,
                  );
                });
              }

              if (
                castedInputData.education &&
                castedInputData.education.length > 0
              ) {
                castedInputData.education.forEach((educationData) => {
                  this.createEducationOrExperience<EducationInput>(
                    educationData,
                    profile,
                  );
                });
              }

              return profile;
            }

            case EUserRole.THERAPIST: {
              const castedInputData = inputData as TherapistProfileInput;

              await transactionalEntityManager.update(
                User,
                authenticatedUser?.id!,
                { image: castedInputData.profilePhotoUrl },
              );

              const therapistProfile = transactionalEntityManager.create(
                TherapistProfile,
                {
                  baseUserProfile: profile,
                  profilePhotoUrl: castedInputData.profilePhotoUrl,
                  certificationPhotoUrl: castedInputData.certificationPhotoUrl,
                  specialization: castedInputData.specialization,
                  description: castedInputData.description,
                  paymentAccountInformation:
                    castedInputData.paymentAccountInformation,
                },
              );

              await TherapistProfile.save(therapistProfile);

              if (
                castedInputData.experience &&
                castedInputData.experience.length > 0
              ) {
                castedInputData.experience.forEach((experienceData) => {
                  this.createEducationOrExperience<ExperienceInput>(
                    experienceData,
                    profile,
                  );
                });
              }

              if (
                castedInputData.education &&
                castedInputData.education.length > 0
              ) {
                castedInputData.education.forEach((educationData) => {
                  this.createEducationOrExperience<EducationInput>(
                    educationData,
                    profile,
                  );
                });
              }

              return profile;
            }
          }

          throw new ApolloError(
            "Could not create profile due to user role ambiguity",
          );
        } catch (err) {
          if (err.code === "23505") {
            throw new UserInputError(
              "Profile information for this user already exists and cannot be recreated.",
            );
          }
          throw err;
        }
      },
    );
  }

  async getProfileData(user?: User): Promise<ProfileQueryResult | undefined> {
    const authenticatedUser = user;

    const baseUserProfile = await BaseUserProfile.findOneOrFail({
      where: {
        user: authenticatedUser,
      },
      relations: ["user"],
    });

    switch (authenticatedUser?.userRole) {
      case EUserRole.CLIENT:
        const clientProfile = await ClientProfile.findOne({
          where: {
            baseUserProfile: baseUserProfile,
          },
        });

        return {
          ...baseUserProfile,
          ...clientProfile,
          email: authenticatedUser.email,
          userRole: authenticatedUser.userRole,
          profilePhotoUrl: baseUserProfile.user.image,
        };

      case EUserRole.VOLUNTEER: {
        const volunteerProfile = await VolunteerProfile.findOne({
          where: {
            baseUserProfile: baseUserProfile,
          },
        });

        const education = await Education.find({
          where: {
            user: baseUserProfile,
          },
        });
        const experience = await Experience.find({
          where: {
            user: baseUserProfile,
          },
        });

        return {
          ...baseUserProfile,
          ...volunteerProfile,
          education,
          experience,
          email: authenticatedUser.email,
          userRole: authenticatedUser.userRole,
          profilePhotoUrl: baseUserProfile.user.image,
        };
      }

      case EUserRole.THERAPIST: {
        const therapistProfile = await TherapistProfile.findOne({
          where: {
            baseUserProfile: baseUserProfile,
          },
        });

        const education = await Education.find({
          where: {
            user: baseUserProfile,
          },
        });
        const experience = await Experience.find({
          where: {
            user: baseUserProfile,
          },
        });

        return {
          ...baseUserProfile,
          ...therapistProfile,
          education,
          experience,
          email: authenticatedUser.email,
          userRole: authenticatedUser.userRole,
        };
      }
    }
  }

  @Query(() => ProfileQueryResult, { nullable: true })
  async getProfile(
    @Ctx() context: IGraphqlContext,
    @Arg("userId", { nullable: true }) userId?: string,
  ): Promise<ProfileQueryResult | undefined> {
    if (userId && context.req.admin) {
      // only admins can query by user id
      const userRepo = context.dbConnection.getRepository(User);
      const user = await userRepo.findOneOrFail({
        id: Number(userId),
      });
      return this.getProfileData(user);
    }

    const { user: authenticatedUser } = context.req;
    return this.getProfileData(authenticatedUser);
  }

  @Mutation(() => BaseUserProfile)
  async createClientProfile(
    @Arg("profile") profile: ClientProfileInput,
    @Ctx() context: IGraphqlContext,
  ): Promise<BaseUserProfile> {
    const { user: authenticatedUser } = context.req;
    return await this.createProfile(
      profile,
      context.dbConnection,
      authenticatedUser!,
      EUserRole.CLIENT,
    );
  }

  @Mutation(() => BaseUserProfile)
  async createVolunteerProfile(
    @Arg("profile") profile: VolunteerProfileInput,
    @Ctx() context: IGraphqlContext,
  ): Promise<BaseUserProfile> {
    const { user: authenticatedUser } = context.req;
    return await this.createProfile(
      profile,
      context.dbConnection,
      authenticatedUser!,
      EUserRole.VOLUNTEER,
    );
  }

  @Mutation(() => BaseUserProfile)
  async createTherapistProfile(
    @Arg("profile") profile: TherapistProfileInput,
    @Ctx() context: IGraphqlContext,
  ): Promise<BaseUserProfile> {
    const { user: authenticatedUser } = context.req;
    return await this.createProfile(
      profile,
      context.dbConnection,
      authenticatedUser!,
      EUserRole.THERAPIST,
    );
  }

  @Mutation(() => ProfileQueryResult)
  async updateProfile(
    @Arg("profileUpdateInput") profileUpdateInput: ProfileUpdateInput,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<ProfileQueryResult> {
    const user = ctx.req.user;

    if (
      !user ||
      user.userRole === EUserRole.CLIENT ||
      user.userRole === EUserRole.NEW_USER
    ) {
      throw new UnauthorizedError();
    }

    if (
      user.userRole === EUserRole.VOLUNTEER &&
      (profileUpdateInput.description ||
        profileUpdateInput.paymentAccountInformation ||
        profileUpdateInput.profilePhotoUrl)
    ) {
      throw new UnauthorizedError();
    }

    const baseUserProfile = await BaseUserProfile.findOneOrFail({
      where: {
        user,
      },
    });

    if (profileUpdateInput.education?.length > 0) {
      profileUpdateInput.education.forEach((education) => {
        this.createEducationOrExperience(education, baseUserProfile);
      });
    }

    if (profileUpdateInput.experience?.length > 0) {
      profileUpdateInput.experience.forEach((experience) => {
        this.createEducationOrExperience(experience, baseUserProfile);
      });
    }

    if (user.userRole === EUserRole.THERAPIST) {
      const therapistProfile = await TherapistProfile.findOneOrFail({
        where: {
          baseUserProfile,
        },
      });

      therapistProfile.description =
        profileUpdateInput.description || therapistProfile.description;
      therapistProfile.profilePhotoUrl =
        profileUpdateInput.profilePhotoUrl || therapistProfile.profilePhotoUrl;
      therapistProfile.paymentAccountInformation =
        profileUpdateInput.paymentAccountInformation ||
        therapistProfile.paymentAccountInformation;

      await therapistProfile.save();
    }

    // this is ensured because of the check for whether this is a new user
    // in which case the user is unauthorized to access this query
    return (await this.getProfile(ctx)) as ProfileQueryResult;
  }
}
