import { ExpressContext, PubSub } from "apollo-server-express";
import User from "../entities/user/User";
import { Connection } from "typeorm";

export enum EGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
}

export enum EEmploymentStatus {
  STUDENT = "STUDENT",
  EMPLOYED = "EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
}

export enum EIssues {
  LOVE = "LOVE",
  WORK = "WORK",
  FRIENDS = "FRIENDS",
  OTHERS = "OTHERS",
}

export enum EChatType {
  REGULAR = "regular",
  ROLEPLAY = "roleplay",
}

export interface IGraphqlContext extends ExpressContext {
  dbConnection: Connection;
  pubsub: PubSub;
  user?: User; // only available in websocket connections
}

export enum EMessageType {
  CLIENT_TO_VOLUNTEER = "CLIENT_TO_VOLUNTEER",
  VOLUNTEER_TO_CLIENT = "VOLUNTEER_TO_CLIENT",
}

export type TPaymentAccountInformation = {
  type: "bkash" | "bank";
  details: Partial<{
    bkashAccountNumber: string;
    bankName: string;
    bankBranch: string;
    bankAccountTitle: string;
    bankAccountNumber: string;
  }>;
};
