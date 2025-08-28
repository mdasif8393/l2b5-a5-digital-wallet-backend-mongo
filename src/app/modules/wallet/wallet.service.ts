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
import { QueryBuilder } from "../../utils/QueryBuilder";
import { walletSearchableFields } from "./wallet.constant";

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
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
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

    if (!senderWallet) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "You can not cash out. Contact with our customer care"
      );
    }

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

    if (payload.amount > senderWallet?.balance) {
      throw new AppError(
        httpStatus.NOT_ACCEPTABLE,
        "You have not sufficient balance"
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
};

const cashIn = async (
  user: JwtPayload,
  receiverId: string,
  payload: { amount: number }
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
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

    if (!senderWallet) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "You can not cash out. Contact with our customer care"
      );
    }

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

    if (payload.amount > senderWallet?.balance) {
      throw new AppError(
        httpStatus.NOT_ACCEPTABLE,
        "You have not sufficient balance"
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
};

const cashOut = async (
  user: JwtPayload,
  agentId: string,
  payload: { amount: number }
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const senderUser = await User.findById(user.userId);
    const receiverUser = await User.findById(agentId);

    if (senderUser?.role !== Role.USER) {
      throw new AppError(httpStatus.BAD_REQUEST, "You can not cash out");
    }

    if (!receiverUser) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver not found");
    }

    if (receiverUser.role !== Role.AGENT) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You can only cash out from Digital wallet agent"
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

    if (!senderWallet) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "You can not cash out. Contact with our customer care"
      );
    }

    if (senderWallet?.status === WalletStatus.BLOCK) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Your wallet is blocked. please, contact with our customer care"
      );
    }
    if (receiverWallet?.status === WalletStatus.BLOCK) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent wallet is blocked. You can not cash out from this agent"
      );
    }

    const cashOutFee = 0.0185;
    const senderCashOutChange = payload.amount * cashOutFee;
    const senderTotalCashOutAmount = payload.amount + senderCashOutChange;

    if (senderTotalCashOutAmount > senderWallet.balance) {
      throw new AppError(
        httpStatus.NOT_ACCEPTABLE,
        "You have not sufficient balance"
      );
    }

    await Wallet.findOneAndUpdate(
      { userId: senderUser?._id },
      { $inc: { balance: -senderTotalCashOutAmount as number } },
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
      fee: senderCashOutChange,
      type: TransactionType.CASH_OUT,
    };

    await Transaction.create([senderTransactionInfo], {
      session,
    });

    // agent wallet and transaction
    await Wallet.findOneAndUpdate(
      { userId: receiverUser?._id },
      { $inc: { balance: senderTotalCashOutAmount as number } },
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
      type: TransactionType.CASH_OUT,
      commission: senderCashOutChange,
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
};

const withdrawMoney = async (
  user: JwtPayload,
  userId: string,
  payload: { amount: number }
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const senderUser = await User.findById(userId);
    const receiverUser = await User.findById(user.userId);

    if (senderUser?.role !== Role.USER) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You can only cash out from user"
      );
    }

    if (!senderUser) {
      throw new AppError(httpStatus.NOT_FOUND, "User is not found");
    }

    if (!receiverUser) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (receiverUser.role !== Role.AGENT) {
      throw new AppError(httpStatus.BAD_REQUEST, "You can not cash out");
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
        "Your are not permitted to cash out money"
      );
    }

    const senderWallet = await Wallet.findOne({ userId: senderUser?._id });
    const receiverWallet = await Wallet.findOne({ userId: receiverUser?._id });

    if (!senderWallet) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "You can not cash out from this user"
      );
    }

    if (senderWallet?.status === WalletStatus.BLOCK) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You can not cash out from this user"
      );
    }
    if (receiverWallet?.status === WalletStatus.BLOCK) {
      throw new AppError(httpStatus.BAD_REQUEST, "Your wallet is blocked.");
    }

    const cashOutFee = 0.0185;
    const senderCashOutChange = payload.amount * cashOutFee;
    const senderTotalCashOutAmount = payload.amount + senderCashOutChange;

    if (senderTotalCashOutAmount > senderWallet.balance) {
      throw new AppError(
        httpStatus.NOT_ACCEPTABLE,
        "User is not sufficient balance"
      );
    }

    await Wallet.findOneAndUpdate(
      { userId: senderUser?._id },
      { $inc: { balance: -senderTotalCashOutAmount as number } },
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
      fee: senderCashOutChange,
      type: TransactionType.CASH_OUT,
    };

    await Transaction.create([senderTransactionInfo], {
      session,
    });

    // agent wallet and transaction
    await Wallet.findOneAndUpdate(
      { userId: receiverUser?._id },
      { $inc: { balance: senderTotalCashOutAmount as number } },
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
      type: TransactionType.CASH_OUT,
      commission: senderCashOutChange,
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
};

const updateWalletStatus = async (
  walletId: string,
  user: JwtPayload,
  walletStatus: { status: string }
) => {
  const adminInfo = await User.findById(user.userId);

  if (adminInfo?.role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      "You are not permitted to block any wallet"
    );
  }

  const walletInfo = await Wallet.findById(walletId);

  const userInfo = await User.findById(walletInfo?.userId);

  if (userInfo?.role !== Role.USER) {
    throw new AppError(httpStatus.BAD_REQUEST, "You can only block user");
  }

  if (
    walletInfo?.status === WalletStatus.BLOCK &&
    walletStatus?.status === WalletStatus.BLOCK
  ) {
    throw new AppError(httpStatus.CONFLICT, "Wallet is already blocked");
  }

  if (
    walletInfo?.status === WalletStatus.UNBLOCK &&
    walletStatus?.status === WalletStatus.UNBLOCK
  ) {
    throw new AppError(httpStatus.CONFLICT, "Wallet is already unblocked");
  }

  const updateWalletStatus = Wallet.findByIdAndUpdate(
    walletId,
    {
      status: walletStatus?.status,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return updateWalletStatus;
};

const getMyWallet = async (user: JwtPayload) => {
  if (user.role === Role.ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have no wallet");
  }

  const walletInfo = await Wallet.findOne({ userId: user.userId });

  if (walletInfo?.status === WalletStatus.BLOCK) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Your wallet is blocked. please, contact with customer care"
    );
  }

  return walletInfo;
};

const getAllWallet = async (
  user: JwtPayload,
  query: Record<string, string>
) => {
  if (user.role !== Role.ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have not permitted");
  }

  const queryBuilder = new QueryBuilder(
    Wallet.find().populate("userId", "-password"),
    query
  );
  const walletsData = queryBuilder
    .filter()
    .search(walletSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    walletsData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const WalletServices = {
  addMoney,
  sendMoney,
  updateWalletStatus,
  getMyWallet,
  getAllWallet,
  cashOut,
  cashIn,
  withdrawMoney,
};
