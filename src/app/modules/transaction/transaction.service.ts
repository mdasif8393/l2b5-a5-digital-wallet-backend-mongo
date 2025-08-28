import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "./transaction.model";

const getAllTransaction = async () => {
  const allTransaction = await Transaction.find({})
    .populate("initiatedBy")
    .populate("receivedBy");

  return allTransaction;
};

const getSingleTransaction = async (user: JwtPayload) => {
  const userTransaction = await Transaction.find({
    $or: [{ initiatedBy: user.userId }, { receivedBy: user.userId }],
  })
    .populate("initiatedBy", "-password")
    .populate("receivedBy", "-password");
  return userTransaction;
};

export const TransactionService = {
  getAllTransaction,
  getSingleTransaction,
};
