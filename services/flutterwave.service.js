const { default: axios } = require("axios");
const baseUrl = "https://api.flutterwave.com/v3";

const getCategories = () => {
  return axios({
    url: `${baseUrl}/top-bill-categories?country=NG`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });
};

module.exports = {
  getCategories,
};
