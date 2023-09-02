import {
  ENotificationContext,
  Notification,
} from "../entities/notification/Notification";
import { createTransport, SendMailOptions } from "nodemailer";
import { IGraphqlContext } from "../types/types";
import User from "../entities/user/User";
import SubscriptionEvents from "../graphql/enums/events";
import { Transaction } from "../entities/transaction/Transaction";
import { Appointment } from "../entities/therapy/Appointment";

export default class NotificationService {
  private static notificationMessages: Record<ENotificationContext, string> = {
    TRANSACTION_APPROVED: "Your transaction has been approved successfully.",
    TRANSACTION_DECLINED:
      "Unfortunately, we could not verify your transaction and hence it has been declined.",
    THERAPY_APPOINTMENT_REQUEST:
      "A client has requested for a therapy session appointment.",
    THERAPY_APPOINTMENT_CREATED:
      "Your requested therapist has created an appointment for you.",
    THERAPY_APPOINTMENT_UPDATED: "An appointment has been updated.",
    TRANSACTION_CREATED: "A new transaction has been created",
    ADMIN_ADDED: "A new admin has been added",
  };

  /**
   * Creates a notification object in the database given the required data and
   * publishes it via pubsub
   * @param param0 the Graphql context object that hold the req object and the
   * dbConnection object
   * @param notificationContext the context of the notification
   * @param payload the corresponding payload object
   * @param forUser the user to notify/create the notification for
   */
  static async createNotificationInDatabase(
    { dbConnection, pubsub }: IGraphqlContext,
    notificationContext: ENotificationContext,
    payload: Transaction | Appointment,
    forUser: User,
  ) {
    const message = this.notificationMessages[notificationContext];
    const notificationRepo = dbConnection.getRepository(Notification);
    const newNotification = notificationRepo.create({
      user: forUser,
      ctx: notificationContext,
      message,
      ctxObject: {
        id: payload.id,
      },
    });

    await notificationRepo.save(newNotification);
    await pubsub.publish(SubscriptionEvents.NEW_NOTIFICATION, newNotification);
  }

  private static generateEmailBody(
    notificationContext: ENotificationContext,
    additionalText?: string,
  ) {
    return `
      <h1>Notification from ShobThik</h1>
      <br />
      <p>Dear ShobThik user,</p>
      <h4>${this.notificationMessages[notificationContext]}. ${
      additionalText || ""
    }</h4>
      Please check the ShobThik website. You will be required to login to view any protected information.
      <br />
      <p>Please do not reply to this email</p>
      <br />

      <h3>Best Regards,</h3>
      <h3>ShobThik Team</h5>
    `;
  }

  static async sendEmail(
    targetEmail: string | string[],
    notificationContext: ENotificationContext,
    additionalText?: string,
  ) {
    const emailTransporter = createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions: SendMailOptions = {
      from: process.env.EMAIL_FROM,
      to: targetEmail,
      subject: `ShobThik: ${this.notificationMessages[notificationContext]}`,
      html: this.generateEmailBody(notificationContext, additionalText),
    };

    try {
      const emailSentInfo = await emailTransporter.sendMail(mailOptions);
      console.log(emailSentInfo);
    } catch (err) {
      console.error(err);
    }
  }
}
