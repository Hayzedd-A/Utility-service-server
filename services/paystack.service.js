const { default: axios } = require("axios");
const TO_KOBO = 100;

const initiatePayment = (email, amount) => {
  return axios({
    url: "https://api.paystack.co/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      email: email,
      amount: amount * TO_KOBO,
    }),
  });
};

const verifyPayment = reference => {
  return axios({
    url: `https://api.paystack.co/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });
};

module.exports = { initiatePayment, verifyPayment };
