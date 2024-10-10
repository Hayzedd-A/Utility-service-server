const { Customers } = require("../models/customers.models");
const { jwtVerifier } = require("../utils/jwt.utils");

const authorization = async (req, res, next) => {
  try {
    const { token } = req.headers;
    console.log(token);
    if (!token) throw new Error("Unauthorized");

    const { email, tokenVersion } = await jwtVerifier(token);
    const customer = await Customers.findOne({
      where: { email: email, token_version: tokenVersion },
    });

    if (!customer) throw new Error("Unauthorized");
    req.params.customer = customer.dataValues;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({
      status: "error",
      message: error.message || "Unauthorized",
    });
  }
};

module.exports = authorization;
