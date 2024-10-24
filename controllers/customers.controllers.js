const {
  Customers,
  Otp_Table,
  Temp_customers,
  Wallets,
  Transactions,
  RecoveryPassword,
} = require("../models/customers.models");
const {
  hashPassword,
  generateOTPLink,
  comparePassword,
  generatePasswordRecoveryLink,
} = require("../utils/password.utils");
const {
  customer_signup_schema,
  customer_login_schema,
  email_schema,
  password_recovery_schema,
} = require("../validations/customers.validations");
const { v4: uuid } = require("uuid");
const { sendEmail } = require("../services/email.service");
const sequelize = require("../config/sequelize");
const { jwtSigner } = require("../utils/jwt.utils");
const { Sequelize } = require("sequelize");
const { getCategories } = require("../services/flutterwave.service");
const OTP_EXPIRY_MINUTE = 10; // 10 minutes
const PASSWORD_RECOVERY_EXPIRY_MINUTE = 15; // 15 minutes

const signCustomerUp = async (req, res) => {
  try {
    // Validate the request body
    const { error } = customer_signup_schema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const { surname, firstname, email, phone, othernames, password } = req.body;

    // check if email exist in database
    const existingCustomer = await Customers.findOne({
      where: { email: email },
    });
    console.log(existingCustomer);
    if (existingCustomer) throw new Error("Email already exist");

    // delete if email exist in the temp_customer table and otp table
    await Temp_customers.destroy({ where: { email: email } });
    await Otp_Table.destroy({ where: { customer_email: email } });

    // Hash the password using bcrypt
    const hashedPassword = await hashPassword(password);
    // check if hashedPassword in an instance of error
    if (hashedPassword instanceof Error) throw new Error(hashedPassword);

    // Create a new customer object with hashed password and salt
    const newCustomer = {
      customer_id: uuid(),
      surname,
      firstname,
      othernames,
      email,
      phone,
      password_hash: hashedPassword[0],
      salt: hashedPassword[1],
    };
    // generate an otp link
    const [otpLink, otp] = generateOTPLink(email);

    // Save the new customer to the database
    await Temp_customers.create(newCustomer);

    // insert into the otp table
    // create the expiry date

    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + OTP_EXPIRY_MINUTE);

    await Otp_Table.create({
      customer_email: email,
      otp: otp,
      expiry_date: expiryDate,
    });

    // Implement logic to send a welcome email to the customer
    // This is done using nodemailer
    const emailBody = {
      html: `<h1>Welcome to PayBill Utility Service</h1><p>Click the button below to verify your account <br>
      <a href="${otpLink}" > Verify</a> </p>`,
      text: `or copy the link to your browser to verify 
      
      ${otpLink}`,
    };
    sendEmail(email, "Verify your email", emailBody);
    // Return a success response
    return res.status(201).json({
      status: "success",
      message:
        "Customer created successfully, Check your email to verify your account",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // check if email exist in database
    const existingCustomer = await Temp_customers.findOne({
      where: { email: email },
    });
    if (!existingCustomer) throw new Error("Email not found");

    // generate an otp link
    const [otpLink, otp] = generateOTPLink(email);

    // insert into the otp table
    // create the expiry date

    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + OTP_EXPIRY_MINUTE);

    await Otp_Table.create({
      customer_email: email,
      otp: otp,
      expiry_date: expiryDate,
    });

    // Implement logic to send a welcome email to the customer
    // This is done using nodemailer
    const emailBody = {
      html: `<h1>Welcome to PayBill Utility Service</h1><p>Click the button below to verify your account <br>
      <a href="${otpLink}" > Verify</a> </p>`,
      text: `or copy the link to your browser to verify 
      
      ${otpLink}`,
    };
    sendEmail(email, "Verify your email", emailBody);
    // Return a success response
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully, Check your email to verify your account",
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, link } = req.query;
    console.log(req.query);
    // check if email exist in database
    const existingCustomer = await Temp_customers.findOne({
      where: { email: email },
      attributes: { exclude: ["sn"] },
    });
    if (!existingCustomer) throw new Error("Invalid or Expired OTP");
    console.log(existingCustomer.dataValues);

    // check if otp match
    const otpRecord = await Otp_Table.findOne({
      where: { customer_email: email },
    });
    // console.log("otp Record", otpRecord.otp);
    if (!otpRecord || otpRecord.otp !== link)
      throw new Error("Invalid or expired OTP");

    // check otp expiry
    const expiryDate = otpRecord.expiry_date;
    const currentDate = new Date();
    if (expiryDate < currentDate) throw new Error("Invalid or expired OTP");

    // delete the otp record
    await Otp_Table.destroy({ where: { customer_email: email } });

    // delete the customer from the temp table
    await Temp_customers.destroy({ where: { email: email } });

    // move the customer data from the temp table to the main table
    sequelize.transaction(async t => {
      await Customers.create(existingCustomer.dataValues, { transaction: t });
      await Otp_Table.destroy(
        { where: { customer_email: email } },
        { transaction: t }
      );
      await Wallets.create(
        {
          customer_id: existingCustomer.dataValues.customer_id,
          wallet_id: uuid(),
        },
        { transaction: t }
      );
    });

    // Return a success response
    return res.status(200).json({
      status: "success",
      message: "Congratulations, your email is verified successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

const logCustomerIn = async (req, res) => {
  try {
    // validate  the request body with joi
    const { error } = customer_login_schema.validate(req.body);
    if (error) throw new Error(error.details[0].message);
    const { email, password } = req.body;

    // check if email exist in database
    const existingCustomer = await Customers.findOne({
      where: { email: email },
    });
    if (!existingCustomer) throw new Error("Invalid email or password");

    // check if password match
    const passwordMatch = await comparePassword(
      password,
      existingCustomer.password_hash
    );
    console.log("Password Match", passwordMatch);
    if (!passwordMatch) throw new Error("Invalid email or password");

    // Implement logic to log a customer in
    // This is done using JWT
    const token = await jwtSigner(email, existingCustomer.token_version);

    // Return a success response
    res.setHeader("access-token", token);
    res.status(200).json({
      status: "success",
      message: "Customer logged in successfully",
    });
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const getCustomerDetails = async (req, res) => {
  try {
    const { customer } = req.params;

    if (customer) {
      // delete sensitive data from the customer
      const {
        password_hash,
        salt,
        token_version,
        created_at,
        updated_at,
        wallet_id,
        customer_id,
        ...customerDetails
      } = customer;
      console.log(customerDetails);
      return res.status(200).json({
        status: "success",
        message: "Customer details retrieved successfully",
        data: customerDetails,
      });
    }
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const getCustomerWallet = async (req, res) => {
  try {
    const { customer } = req.params;

    if (customer) {
      // get the customer wallet excluding sensitive data
      const wallet = await Wallets.findOne({
        where: { customer_id: customer.customer_id },
        attributes: {
          exclude: ["customer_id", "wallet_id", "updated_at", "created_at"],
        },
      });

      // get transactions history excluding sensitive data
      const transactions = await Transactions.findAll({
        where: { customer_id: customer.customer_id },
        attributes: {
          exclude: [
            "transaction_id",
            "customer_id",
            "updated_at",
            "created_at",
          ],
        },
        order: [["created_at", "DESC"]],
      });

      const customerDetails = {
        wallet: wallet,
        transactions: transactions,
      };

      // return the customer details with the wallet balance
      return res.status(200).json({
        status: "success",
        message: "Customer details retrieved successfully",
        data: customerDetails,
      });
    }
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const initiatePasswordRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    // validate the email
    const { error } = email_schema.validate({ email });
    if (error) throw new Error("Invalid email");

    // check if email exist in database
    const existingCustomer = await Customers.findOne({
      where: { email: email },
    });
    if (!existingCustomer) throw new Error("Email does not exist");

    // generate a password reset link
    const [resetLink, resetToken] = generatePasswordRecoveryLink();

    // generate expire time
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + PASSWORD_RECOVERY_EXPIRY_MINUTE
    );

    // save the password reset link and password in the database
    await RecoveryPassword.create({
      customer_email: email,
      reset_link: resetToken,
      expires_date: expiresAt,
    });

    // Implement logic to send a password reset email to the customer
    // This is done using nodemailer
    const emailBody = {
      html: `<h1>Password Reset Request</h1><p>Click the button below
      to reset your password, <br>
      Link expires in 15 minutes <br>
      <a href="${resetLink}" > Reset Password</a> </p>`,
      text: `or copy the link to your browser to reset your password <br> ${resetLink}`,
    };
    sendEmail(email, "Password Reset Request", emailBody);
    // Return a success response
    res.status(201).json({
      status: "success",
      message: "Password recovery email sent successfully",
    });
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const completePasswordRecovery = async (req, res) => {
  try {
    const { email, password, recovery_code } = req.body;
    console.log(password);
    // validate the email, password and confirm password
    const { error } = password_recovery_schema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    // check email and recovery code from the password recovery table
    const recoveryRecord = await RecoveryPassword.findOne({
      where: { customer_email: email, reset_link: recovery_code },
    });

    if (!recoveryRecord) throw new Error("Invalid or expired reset link");

    const currentDate = new Date();
    if (recoveryRecord.expires_date < currentDate)
      throw new Error("Invalid or expired reset link");

    // hash the password
    const [hashedPassword, salt] = await hashPassword(password);

    // update the password in the customer table and invalidate all existing token
    // so that user can be signed out from other devices.
    await Customers.update(
      {
        password_hash: hashedPassword,
        salt: salt,
        token_version: Sequelize.literal("token_version + 1"), // Increment the token_version
      },
      { where: { email: email } }
    );

    // delete the password recovery record
    await RecoveryPassword.destroy({
      where: { customer_email: email },
    });

    // Return a success response
    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const confirmToken = async (req, res) => {
  // if the program should get here, it means it passed the authentication
  // and the token is valid
  // normally use the token to identify the user and continue the request
  // here we just return a success message
  res.status(200).json({
    status: "success",
    message: "Token confirmed successfully",
  });
};

module.exports = {
  signCustomerUp,
  verifyEmail,
  logCustomerIn,
  initiatePasswordRecovery,
  completePasswordRecovery,
  resendOTP,
  getCustomerDetails,
  getCustomerWallet,
  confirmToken,
};
