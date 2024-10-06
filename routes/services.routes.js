const Express = require("express");
const {
  getServices,
  initializePayments,
  fundWallet,
} = require("../controllers/services.controllers");
const authorization = require("../middlewares/authorization");
const Router = Express.Router();

Router.get(
  "/initiate-wallet-funding/:amount",
  authorization,
  initializePayments
);
Router.post("/complete-wallet-funding", authorization, fundWallet);
Router.get("/categories", authorization, getServices);

module.exports = Router;
