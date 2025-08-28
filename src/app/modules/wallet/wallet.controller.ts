import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { WalletServices } from "./wallet.service";
import { sendResponse } from "../../utils/sendResponse";

import { JwtPayload } from "jsonwebtoken";

const addMoney = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletServices.addMoney(
    req.user as JwtPayload,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Add money successfully",
    data: result,
  });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const receiverId = req.params.receiverId;

  const result = await WalletServices.sendMoney(
    req.user as JwtPayload,
    receiverId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "send money successfully",
    data: result,
  });
});

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const receiverId = req.params.receiverId;

  const result = await WalletServices.cashIn(
    req.user as JwtPayload,
    receiverId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "sCash In successfully",
    data: result,
  });
});

const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await WalletServices.withdrawMoney(
    req.user as JwtPayload,
    userId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Cash out successfully.",
    data: result,
  });
});

const cashOut = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.params.agentId;

  const result = await WalletServices.cashOut(
    req.user as JwtPayload,
    agentId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Cash out successfully. Collect your money from agent",
    data: result,
  });
});

const updateWalletStatus = catchAsync(async (req: Request, res: Response) => {
  const walletId = req.params.walletId;
  const result = await WalletServices.updateWalletStatus(
    walletId,
    req.user as JwtPayload,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet is blocked successfully",
    data: result,
  });
});

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletServices.getMyWallet(req.user as JwtPayload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet is retrieved successfully",
    data: result,
  });
});

const getAllWallet = catchAsync(async (req: Request, res: Response) => {
  const result = await WalletServices.getAllWallet(req.user as JwtPayload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallets are retrieved successfully",
    data: result,
  });
});

export const WalletControllers = {
  addMoney,
  sendMoney,
  updateWalletStatus,
  getMyWallet,
  getAllWallet,
  cashOut,
  cashIn,
  withdrawMoney,
};
