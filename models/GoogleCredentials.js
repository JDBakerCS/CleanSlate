const { DataTypes } = require("sequelize");
const db = require("../config/db");

const GoogleCredentials = db.define("GoogleCredentials", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    googleSub: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    googleEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,

        references: {
            model: "Users",
            key: "id"
        },

        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },

    displayName: {
        type: DataTypes.STRING,
        allowNull: true
    },

    encryptedRefreshToken: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    refreshTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    encryptedAccessToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    accessTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    grantedScopes: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: []
    },

    authorizationStatus: {
        type: DataTypes.ENUM(
            "connected",
            "reauthorization_required"
        ),

        allowNull: false,
        defaultValue: "connected"
    }
})

module.exports = GoogleCredentials;