require("dotenv").config();
const Express = require("express");
const routeMap = require("express-routemap");
const CustormerRoutes = require("./routes/customers.routes");
const ServicesRoutes = require("./routes/services.routes");
const sequelize = require("./config/sequelize");
const cors = require("cors");
const {
  Customers,
  Otp_Table,
  Temp_customers,
  Wallets,
  Transactions,
  RecoveryPassword,
} = require("./models/customers.models");

const app = Express();
app.use(Express.json());
// enable cors
app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["access-token"],
  })
);
const PORT = process.env.PORT;

try {
  (async () => {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    // sync your models with the database
    // await sequelize.sync({ force: true });
    // await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
    app.listen(PORT, () => {
      routeMap(app);
      console.log(`Server running on port ${PORT}`);
    });
  })();
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use("/customers", CustormerRoutes);
app.use("/services", ServicesRoutes);
