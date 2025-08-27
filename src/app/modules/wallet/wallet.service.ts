import { Transaction } from "./../transaction/transaction.model";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { IsActive, Role } from "../user/user.interface";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import { createTransactionId } from "../../utils/createTransactionId";
import { TransactionType } from "../transaction/transaction.interface";
import { WalletStatus } from "./wallet.interface";

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

    const userWallet = await Wallet.findOne({ userId: isUserExists?._id });

    if (userWallet?.status === WalletStatus.BLOCK) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Your wallet is blocked. please, contact with our customer care"
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

const sendMoney = async (
  user: JwtPayload,
  receiverId: string,
  payload: { amount: number }
) => {
  /**
   {
  user: {
    userId: '68add89a984f991154310e1f',
    email: 'user@gmail.com',
    role: 'USER',
    iat: 1756288237,
    exp: 1757152237
  },
  receiverId: '68aedad2f08f7afac3598a4e',
  payload: { amount: 50 }
}   
   */

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    // console.log(receiverId, user.userId);

    const senderUser = await User.findById(user.userId);
    const receiverUser = await User.findById(receiverId);

    if (!receiverUser) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
    }

    if (receiverUser.role === Role.AGENT || receiverUser.role === Role.ADMIN) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You can only send money to user's account"
      );
    }

    if (
      senderUser?.isDeleted ||
      senderUser?.isActive === IsActive.BLOCKED ||
      senderUser?.isActive === IsActive.INACTIVE
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "You can not send money");
    }
    if (
      receiverUser?.isDeleted ||
      receiverUser?.isActive === IsActive.BLOCKED ||
      receiverUser?.isActive === IsActive.INACTIVE
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver is not permitted to receive money"
      );
    }

    const senderWallet = await Wallet.findOne({ userId: senderUser?._id });
    const receiverWallet = await Wallet.findOne({ userId: receiverUser?._id });
    if (senderWallet?.status === WalletStatus.BLOCK) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Your wallet is blocked. please, contact with our customer care"
      );
    }
    if (receiverWallet?.status === WalletStatus.BLOCK) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver wallet is blocked. You can not send money to this user"
      );
    }

    await Wallet.findOneAndUpdate(
      { userId: senderUser?._id },
      { $inc: { balance: -payload?.amount as number } },
      {
        runValidators: true,
        new: true,
        session,
      }
    );

    const senderTransactionInfo = {
      transactionId: createTransactionId(),
      wallet: senderWallet?._id,
      initiatedBy: senderUser?._id,
      receivedBy: receiverUser?._id,
      amount: payload?.amount,
      type: TransactionType.SEND_MONEY,
    };

    await Transaction.create([senderTransactionInfo], {
      session,
    });

    await Wallet.findOneAndUpdate(
      { userId: receiverUser?._id },
      { $inc: { balance: payload?.amount as number } },
      {
        runValidators: true,
        new: true,
        session,
      }
    );

    const receiverTransactionInfo = {
      transactionId: createTransactionId(),
      wallet: receiverWallet?._id,
      initiatedBy: senderUser?._id,
      receivedBy: receiverUser?._id,
      amount: payload?.amount,
      type: TransactionType.CASH_IN,
    };

    await Transaction.create([receiverTransactionInfo], {
      session,
    });

    await session.commitTransaction(); //transaction
    session.endSession();

    return senderTransactionInfo;
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    throw error;
  }

  return null;
};

export const WalletServices = {
  addMoney,
  sendMoney,
};
