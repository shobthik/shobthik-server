import { GraphQLJSONObject } from "graphql-type-json";
import { Field, ObjectType } from "type-graphql";
import Message from "../entities/message/Message";

export interface IVolunteerActivityData {
  volunteerUserId: number;
  volunteerName: string;
  volunteerEmail: string;
  volunteerImagePath: string;
  volunteerSince: Date;
  activityData: {
    totalNumberOfMessagesSinceJoining: number;
    recentMessageData: Message[];
  };
}

export interface IVolunteerStatistics {
  numberOfVolunteers: number;
  totalNumberOfMessagesByVolunteers: number;
  totalNumberOfMessagesByClients: number;
  numberOfChatsIgnored: number;
  numberOfChatsAccepted: number;
  totalNumberOfChatsCreated: number;
  messagesCount: {
    volunteerId: number;
    volunteerName: string;
    messageCount: number;
  }[];
}

@ObjectType()
export class VolunteerActivityData implements IVolunteerActivityData {
  @Field()
  volunteerUserId: number;

  @Field()
  volunteerName: string;

  @Field()
  volunteerEmail: string;

  @Field(() => Date)
  volunteerSince: Date;

  @Field()
  volunteerImagePath: string;

  @Field(() => GraphQLJSONObject)
  activityData: {
    totalNumberOfMessagesSinceJoining: number;
    recentMessageData: Message[];
  };
}

@ObjectType()
export class VolunteerStatistics implements IVolunteerStatistics {
  @Field()
  numberOfVolunteers: number;

  @Field()
  totalNumberOfMessagesByVolunteers: number;

  @Field()
  totalNumberOfMessagesByClients: number;

  @Field()
  numberOfChatsIgnored: number;

  @Field()
  numberOfChatsAccepted: number;

  @Field()
  totalNumberOfChatsCreated: number;

  @Field(() => [GraphQLJSONObject])
  messagesCount: {
    volunteerId: number;
    volunteerName: string;
    messageCount: number;
  }[];
}
