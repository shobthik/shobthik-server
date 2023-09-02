import { IGraphqlContext } from "../../types/types";
import { Arg, Ctx, Mutation, Resolver, UnauthorizedError } from "type-graphql";
import BlockRecord from "../../entities/user/BlockRecord";
import { UserInputError } from "apollo-server-express";
import Chat from "../../entities/chat/Chat";
import { EUserRole } from "../../entities/user/User";

/**
 *
 * @param userId the user id in a string format
 * @returns numeric version of the userId if it is valid
 * @throws UserInputError if the given string cannot be converted to a numeric value
 */
export const convertUserIdToNumber = (userId: string) => {
  const numericId = parseInt(userId);

  if (isNaN(numericId)) {
    throw new UserInputError("Invalid user id");
  }

  return numericId;
};

/**
 *
 * @param blockRecords an array of BlockRecords that describes the current list of blocked users
 * @returns an array of user ids that are currently blocked as per the block records
 */
export const findBlockedUserIds = (blockRecords: BlockRecord[]) =>
  blockRecords.map((blockRecord) => blockRecord.blockedUserId);

/**
 *
 * @param userId the user id to search for
 * @param blockedIds the current array of blocked ids
 * @returns boolean value indicating whether the user id exists in the given array of blocked ids
 */
export const isGivenUserInBlockList = (
  userId: number,
  blockRecords: BlockRecord[],
) => {
  const blockIds = findBlockedUserIds(blockRecords);
  const isUserIdInBlockList = blockIds.includes(userId);
  return isUserIdInBlockList;
};

@Resolver()
export default class BlockUserResolver {
  /**
   * Block the given user id if it already isn't blocked by the current logged in user. The logged
   * in user must be a volunteer to be able to block someone.
   * @param userId string - the user id to block
   * @param ctx IGraphQlContext - the graphql context object
   * @returns an array of block records.
   */
  @Mutation(() => BlockRecord, { nullable: true })
  async blockUser(
    @Arg("userId") userId: string,
    @Arg("chatId") chatId: string,
    @Ctx() ctx: IGraphqlContext,
  ): Promise<BlockRecord | undefined> {
    if (!(ctx.req.user?.userRole === EUserRole.VOLUNTEER)) {
      throw new UnauthorizedError();
    }

    const numericUserId = convertUserIdToNumber(userId);
    const currentBlockRecords = await BlockRecord.getBlockRecordsForCurrentUser(
      ctx.req.user!.id,
    );

    if (isGivenUserInBlockList(numericUserId, currentBlockRecords)) {
      return undefined;
    }

    const newBlockRecord = BlockRecord.create({
      blockedByUserId: ctx.req.user.id,
      blockedUserId: numericUserId,
    });

    await newBlockRecord.save();

    // update the chat
    Chat.update(
      {
        chatId: chatId,
      },
      {
        // @ts-ignore
        volunteer: null,
      },
    );

    return newBlockRecord;
  }
}
