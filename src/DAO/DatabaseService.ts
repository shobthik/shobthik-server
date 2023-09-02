import { Connection, ConnectionOptions, createConnection } from "typeorm";
import Chat from "../entities/chat/Chat";
import ChatReport from "../entities/chat/ChatReport";
import Message from "../entities/message/Message";
import Education from "../entities/qualifications/Education";
import Experience from "../entities/qualifications/Experience";
import { Appointment } from "../entities/therapy/Appointment";
import { AppointmentRating } from "../entities/therapy/AppointmentRating";
import { AppointmentReport } from "../entities/therapy/AppointmentReport";
import Admin from "../entities/user/Admin";
import BaseUserProfile from "../entities/user/BaseUserProfile";
import BlockRecord from "../entities/user/BlockRecord";
import { ClientProfile } from "../entities/user/ClientProfile";
import TherapistProfile from "../entities/user/TherapistProfile";
import User from "../entities/user/User";
import VolunteerProfile from "../entities/user/VolunteerProfile";
import { Transaction } from "../entities/transaction/Transaction";
import { Notification } from "../entities/notification/Notification";

export class DatabaseService {
  private static databaseConnection: Connection;

  private async connectToDatabase() {
    try {
      const config: ConnectionOptions = {
        type: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [
          Admin,
          User,
          BaseUserProfile,
          ClientProfile,
          VolunteerProfile,
          TherapistProfile,
          Education,
          Experience,
          Message,
          Chat,
          Transaction,
          ChatReport,
          BlockRecord,
          Notification,
          Appointment,
          AppointmentRating,
          AppointmentReport,
        ],
        synchronize: false,
        logging: true,

        // https://stackoverflow.com/questions/67546054/typescript-typeorm-cannot-use-import-statement-outside-a-module
        migrations: ["dist/src/migrations/*{.ts,.js}"],
        cli: {
          migrationsDir: "src/migrations",
        },
      };
      const connection = await createConnection(config);
      DatabaseService.databaseConnection = connection;
      console.log("Database connection established successfully");
    } catch (err) {
      console.error(err);
    }
  }

  static async getConnection() {
    if (this.databaseConnection) {
      return this.databaseConnection;
    }

    const databaseService = new DatabaseService();
    await databaseService.connectToDatabase();
    return this.databaseConnection;
  }
}
