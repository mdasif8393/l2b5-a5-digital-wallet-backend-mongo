import { Types } from "mongoose";

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCEL = "CANCEL",
}

export enum TransactionType {
  ADD_MONEY = "ADD_MONEY",
  SEND_MONEY = "SEND_MONEY",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  WITHDRAW = "WITHDRAW",
}

export interface ITransaction {
  initiatedBy: Types.ObjectId;
  receivedBy: Types.ObjectId;
  amount: number;
  fee: number;
  commission: number;
  status: TransactionStatus;
  type: TransactionType;
}
