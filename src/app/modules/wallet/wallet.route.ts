import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { WalletControllers } from "./wallet.controller.ts";
import { addMoneyZodSchema } from "./wallet.validation";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/add-money",
  validateRequest(addMoneyZodSchema),
  checkAuth(Role.USER),
  WalletControllers.addMoney
);

router.post(
  "/send-money/:receiverId",
  validateRequest(addMoneyZodSchema),
  checkAuth(Role.USER),
  WalletControllers.sendMoney
);

export const WalletRoutes = router;
