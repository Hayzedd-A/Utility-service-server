const Express = require("express");
const {
  signCustomerUp,
  verifyEmail,
  logCustomerIn,
  initializePayments,
  fundWallet,
  initiatePasswordRecovery,
  completePasswordRecovery,
  resendOTP,
} = require("../controllers/customers.controllers");
const authorization = require("../middlewares/authorization");
const Router = Express.Router();

// POST /signup a customer
Router.post("/signup", signCustomerUp);
Router.get("/verify-otp", verifyEmail);
Router.post("/resend-otp", resendOTP);
Router.post("/login", logCustomerIn);
Router.post("/initiate-password-recovery", initiatePasswordRecovery);
Router.post("/complete-password-recovery", completePasswordRecovery);
Router.get(
  "/initiate-wallet-funding/:amount",
  authorization,
  initializePayments
);
Router.post("/complete-wallet-funding", authorization, fundWallet);

module.exports = Router;
