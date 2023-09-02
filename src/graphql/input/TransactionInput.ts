import { Field, InputType } from "type-graphql";
import { ITransaction } from "../../entities/transaction/Transaction";

@InputType()
export default class TransactionInput implements Partial<ITransaction> {
  @Field()
  bkashTransactionId: string;

  @Field()
  targetTherapistId: string;

  @Field()
  transactionAmount: number;

  @Field()
  lastFourDigitsOfNumber: string;

  @Field({ nullable: true })
  specialNotes: string;
}
