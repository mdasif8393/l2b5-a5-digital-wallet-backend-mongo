import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { IWallet } from "./wallet.interface";
import { User } from "../user/user.model";
import { AgentStatus, Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";

const addMoney = async (user: JwtPayload, payload: { amount: number }) => {
  const isUserExists = await User.findById(user.userId);

  if (isUserExists?.role === Role.ADMIN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can not add money by yourself"
    );
  }
  if (isUserExists?.role === Role.AGENT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can not add money by yourself"
    );
  }

  const result = await Wallet.findOneAndUpdate(
    { userId: isUserExists?._id },
    { $inc: { balance: payload?.amount as number } },
    {
      runValidators: true,
      new: true,
    }
  ).populate("userId", "-password");
  return result;
};

export const WalletServices = {
  addMoney,
};
