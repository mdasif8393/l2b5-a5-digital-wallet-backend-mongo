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

const blockWallet = catchAsync(async (req: Request, res: Response) => {
  const walletId = req.params.walletId;

  const result = await WalletServices.blockWallet(
    walletId,
    req.user as JwtPayload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet is blocked successfully",
    data: result,
  });
});

export const WalletControllers = {
  addMoney,
  sendMoney,
  blockWallet,
};
