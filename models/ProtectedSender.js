const { DataTypes } = require("sequelize")
const db = require("../config/db");

const ProtectedSender = db.define(
    "ProtectedSender",
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
        displayName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        senderEmail: {
            type: DataTypes.STRING(320),
            allowNull: false,
            set(value) {
                this.setDataValue(
                    "senderEmail",
                    value.trim().toLowerCase()
                );
            },
            validate: {
                isEmail: true,
            },
        },
    },
    {
        tableName: "protected_senders",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId", "senderEmail"],
            },
        ],
    }
);

module.exports = ProtectedSender;