import httpStatus from "http-status-codes";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";
import { JwtPayload } from "jsonwebtoken";

const getAllTransaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await TransactionService.getAllTransaction(
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: "All Transactions Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const getSingleTransaction = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TransactionService.getSingleTransaction(
    req.user as JwtPayload,
    query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.ACCEPTED,
    message: "All Transactions Retrieved Successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const TransactionController = {
  getAllTransaction,
  getSingleTransaction,
};
