const { DataTypes } = require("sequelize")
const db = require("../config/db");

const ScanItem = db.define(
    "ScanItem",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        scanId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        gmailMessageId: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        threadId: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        senderName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        senderEmail: {
            type: DataTypes.STRING(320),
            allowNull: false,
        },
        subject: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        snippet: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        receivedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        category: {
            type: DataTypes.ENUM(
                "important",
                "promotional",
                "newsletter",
                "automated_notification",
                "low_priority",
                "needs_review"
            ),
            allowNull: true,
        },
        recommendedAction: {
            type: DataTypes.ENUM("keep", "archive", "trash", "review"),
            allowNull: true,
        },
        confidence: {
            type: DataTypes.ENUM("high", "medium", "low"),
            allowNull: true,
        },
        explanation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        userDecision: {
            type: DataTypes.ENUM("keep", "archive", "trash", "skip"),
            allowNull: true,
        },
        actionStatus: {
            type: DataTypes.ENUM("pending", "successful", "failed"),
            allowNull: false,
            defaultValue: "pending",
        },
        actionError: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "scan_items",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["scanId", "gmailMessageId"],
            },
        ],
    }
);

module.exports = ScanItem;