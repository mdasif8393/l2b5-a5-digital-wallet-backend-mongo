import { model, Schema } from "mongoose";
import { WalletStatus } from "./wallet.interface";

const walletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: Object.values(WalletStatus) },
    balance: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Wallet = model("Wallet", walletSchema);
