import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "./transaction.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { transactionSearchableFields } from "./transaction.constant";

const getAllTransaction = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Transaction.find()
      .populate("initiatedBy", "-password")
      .populate("receivedBy", "-password"),
    query
  );
  const transactionsData = queryBuilder
    .filter()
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactionsData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleTransaction = async (
  user: JwtPayload,
  query: Record<string, string>
) => {
  const queryBuilder = new QueryBuilder(
    Transaction.find({
      $or: [{ initiatedBy: user.userId }, { receivedBy: user.userId }],
    })
      .populate("initiatedBy", "-password")
      .populate("receivedBy", "-password"),
    query
  );

  const transactionsData = queryBuilder
    .filter()
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    transactionsData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const TransactionService = {
  getAllTransaction,
  getSingleTransaction,
};
