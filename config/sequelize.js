const { Sequelize } = require("sequelize");

DATABASE_NAME = process.env.DB_NAME;
DATABASE_USER = process.env.DB_USER;
DATABASE_PASSWORD = process.env.DB_PASSWORD;
DATABASE_HOST = process.env.DB_HOST;
DATABASE_PORT = process.env.DB_PORT;

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
