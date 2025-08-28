import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { TransactionController } from "./transaction.controller";
import { Role } from "../user/user.interface";

const router = express.Router();

router.get(
  "/single-user-transactions",
  checkAuth(Role.AGENT, Role.USER),
  TransactionController.getSingleTransaction
);

router.get(
  "/all-transaction",
  checkAuth(Role.ADMIN),
  TransactionController.getAllTransaction
);

export const TransactionRoutes = router;
