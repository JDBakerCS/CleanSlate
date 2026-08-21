const { Sequelize } = require("sequelize");
require("dotenv").config();

// Deployed environments can provide one hosted PostgreSQL connection string.
// When DATABASE_URL is empty, use the local PostgreSQL settings instead.
const db = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: process.env.DB_DIALECT || "postgres",
        }
    );

module.exports = db;
