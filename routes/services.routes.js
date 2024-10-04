const Express = require("express");
const { getServices } = require("../controllers/services.controllers");
const authorization = require("../middlewares/authorization");
const Router = Express.Router();

Router.get("/categories", authorization, getServices);

module.exports = Router;
