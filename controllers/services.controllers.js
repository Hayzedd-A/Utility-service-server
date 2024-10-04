const { getCategories } = require("../services/flutterwave.service");

const getServices = async (req, res) => {
  try {
    const { data } = await getCategories();
    // console.log(data);
    data.data.length = 5;
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
};
