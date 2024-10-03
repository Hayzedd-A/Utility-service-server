const Express = require("express");
const { getServices } = require("../controllers/customers.controllers");
const authorization = require("../middlewares/authorization");
const Router = Express.Router();

Router.get("/categories", authorization, getServices);

module.exports = Router;
