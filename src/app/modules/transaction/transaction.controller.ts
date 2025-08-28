import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";
import { JwtPayload } from "jsonwebtoken";

const getAllTransaction = catchAsync(async (req: Request, res: Response) => {
  const result = await TransactionService.getAllTransaction();
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "All transactions retrieved successfully",
    data: result,
  });
});
const getSingleTransaction = catchAsync(async (req: Request, res: Response) => {
  console.log(req.user);
  const result = await TransactionService.getSingleTransaction(
    req.user as JwtPayload
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Transaction retrieved successfully",
    data: result,
  });
});

export const TransactionController = {
  getAllTransaction,
  getSingleTransaction,
};
