import { model, Schema } from "mongoose";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receivedBy: {
      type: Schema.Types.ObjectId || null,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
    },
    fee: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    // status: {
    //   type: String,
    //   enum: Object.values(TransactionStatus),
    // },
    type: {
      type: String,
      enum: Object.values(TransactionType),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
