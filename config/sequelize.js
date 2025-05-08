const { Sequelize } = require("sequelize");

let DATABASE_NAME = process.env.DB_NAME;
let DATABASE_USER = process.env.DB_USER;
let DATABASE_PASSWORD = process.env.DB_PASSWORD;
let DATABASE_HOST = process.env.DB_HOST;
let DATABASE_PORT = process.env.DB_PORT;

// Initialize your database connection here.

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    port: DATABASE_PORT,
    host: DATABASE_HOST,
    dialect: "mysql", // or 'postgres', 'mariadb', 'sqlite', 'mssql'
  }
);

module.exports = sequelize;
