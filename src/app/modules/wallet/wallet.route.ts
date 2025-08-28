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

router.get(
  "/my-wallet",
  checkAuth(Role.AGENT, Role.USER),
  WalletControllers.getMyWallet
);
router.get(
  "/all-wallet",
  checkAuth(Role.ADMIN),
  WalletControllers.getAllWallet
);

router.post(
  "/block-wallet/:walletId",
  checkAuth(Role.ADMIN),
  WalletControllers.blockWallet
);

router.post(
  "/cash-out/:agentId",
  validateRequest(addMoneyZodSchema),
  checkAuth(Role.USER),
  WalletControllers.withdrawMoney
);

router.post(
  "/send-money/:receiverId",
  validateRequest(addMoneyZodSchema),
  checkAuth(Role.USER),
  WalletControllers.sendMoney
);

export const WalletRoutes = router;
