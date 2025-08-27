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

export const WalletControllers = {
  addMoney,
};
