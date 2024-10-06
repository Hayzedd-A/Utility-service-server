const { Transactions, Wallets } = require("../models/customers.models");
const { v4: uuid } = require("uuid");
const { getCategories } = require("../services/flutterwave.service");
const {
  initiatePayment,
  verifyPayment,
} = require("../services/paystack.service");
const { payment_schema } = require("../validations/customers.validations");
const TO_NAIRA = 100; // 100 kobo equals 1 naira

const initializePayments = async (req, res) => {
  try {
    const { amount, customer } = req.params;

    // validate the amount
    const { error } = payment_schema.validate({ amount });
    if (error) throw new Error("Invalid amount");

    // initiate the payment gateway
    const { data } = await initiatePayment(customer.email, amount);
    if (!data.status) throw new Error("Something went wrong");

    res.status(200).json({
      status: "success",
      message: "Payment initiated successfully",
      reference: data.data.reference,
      link: data.data.authorization_url,
    });
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const fundWallet = async (req, res) => {
  try {
    const { customer } = req.params;
    const { reference } = req.body;
    if (!reference) throw new Error("Reference is needed");
    // validate the reference
    console.log(reference);

    // verify the payment
    const { data } = await verifyPayment(reference);
    // console.log(data);
    // return;

    if (!data.status) throw new Error("Transaction reference is invalid");
    if (data.data.status !== "success")
      throw new Error("The transaction was not successful");

    // chech if the reference already exist in the trasaction and have been used
    const existingTransaction = await Transactions.findOne({
      where: { payment_reference: reference, status: "completed" },
    });

    if (existingTransaction != null)
      throw new Error("This transaction reference has already been used");

    const amount = data.data.amount / TO_NAIRA;
    // create a new transaction record
    await Transactions.create({
      transaction_id: uuid(),
      customer_id: customer.customer_id,
      payment_reference: reference,
      amount: amount,
      status: "completed",
      type: "credit",
      description: "Wallet funding from Payment platform",
    });

    // fetch the customer and their wallet
    const wallet = await Wallets.findOne({
      where: { customer_id: customer.customer_id },
    });

    // update the wallet balance
    wallet.balance = Number(wallet.balance) + Number(amount);
    await wallet.save();

    res.status(200).json({
      status: "success",
      message: "Payment successful, wallet balance updated",
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const getServices = async (req, res) => {
  try {
    const { data } = await getCategories();
    // console.log(data);
    data.data.length = 6;
    res.status(200).json({
      status: "success",
      message: "Services retrieved successfully",
      data: data.data,
    });
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const buyAirtimeOrData = async (req, res) => {};

module.exports = {
  getServices,
  buyAirtimeOrData,
  initializePayments,
  fundWallet,
};
