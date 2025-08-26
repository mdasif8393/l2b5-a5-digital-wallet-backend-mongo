import { Router } from "express";
// import { AuthRoutes } from "../modules/auth/auth.route";

// import { PaymentRoutes } from "../modules/payment/payment.route";

import { UserRoutes } from "../modules/user/user.route";
import { WalletRoutes } from "../modules/wallet/wallet.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/wallet",
    route: WalletRoutes,
  },
  {
    path: "/transaction",
    route: WalletRoutes,
  },
  // {
  //   path: "/auth",
  //   route: AuthRoutes,
  // },

  // {
  //   path: "/payment",
  //   route: PaymentRoutes,
  // },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
