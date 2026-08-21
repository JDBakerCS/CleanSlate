const { DataTypes } = require("sequelize");
const db = require("../config/db");

const ClassificationRun = db.define(
    "ClassificationRun",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        result: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    },
    {
        tableName: "classification_runs",
        timestamps: true,
    }
);

module.exports = ClassificationRun;
