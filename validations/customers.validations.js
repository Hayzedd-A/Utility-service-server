const joi = require("joi");

const customer_signup_schema = joi.object({
  surname: joi.string().required(),
  firstname: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string().optional(),
  othernames: joi.string().optional(),
  password: joi.string().min(8).uppercase().lowercase().alphanum().required(),
  confirm_password: joi.string(),
});

const payment_schema = joi.object({
  amount: joi.number().positive().min(500).required(),
});

const customer_login_schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string(),
});

const email_schema = joi.object({
  email: joi.string().email().required(),
});

const password_recovery_schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).uppercase().lowercase().alphanum().required(),
  // confirm_password: joi.ref("password"),
  recovery_code: joi.string().required(),
});

module.exports = {
  customer_signup_schema,
  payment_schema,
  customer_login_schema,
  email_schema,
  password_recovery_schema,
};
