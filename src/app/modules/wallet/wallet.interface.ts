import { Types } from "mongoose";

export enum WalletStatus {
  BLOCK = "BLOCK",
  UNBLOCK = "UNBLOCK",
}

export interface IWallet {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  status: WalletStatus;
  balance: number;
}
