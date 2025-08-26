import { model, Schema } from "mongoose";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>({
  initiatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  receivedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
  },
  fee: {
    type: Number,
  },
  commission: {
    type: Number,
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
  },
});

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
