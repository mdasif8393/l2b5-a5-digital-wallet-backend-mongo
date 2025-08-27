import { Transaction } from "./../transaction/transaction.model";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { IWallet } from "./wallet.interface";
import { User } from "../user/user.model";
import { AgentStatus, Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import { createTransactionId } from "../../utils/createTransactionId";
import { TransactionType } from "../transaction/transaction.interface";

const addMoney = async (user: JwtPayload, payload: { amount: number }) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
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

    const updateWallet = await Wallet.findOneAndUpdate(
      { userId: isUserExists?._id },
      { $inc: { balance: payload?.amount as number } },
      {
        runValidators: true,
        new: true,
        session,
      }
    );

    const newTransaction = {
      transactionId: createTransactionId(),
      wallet: updateWallet?._id,
      initiatedBy: updateWallet?.userId?._id,
      amount: payload?.amount,
      type: TransactionType.ADD_MONEY,
    };

    const createTransaction = await Transaction.create([newTransaction], {
      session,
    });

    await session.commitTransaction(); //transaction
    session.endSession();

    return createTransaction;
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();

    throw error;
  }
};

export const WalletServices = {
  addMoney,
};
