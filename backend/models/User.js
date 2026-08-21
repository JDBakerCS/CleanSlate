const { DataTypes } = require("sequelize");
const db = require("../config/db");


const User = db.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    sessionTokenHash: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },

    sessionTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,   
    },

    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    }
})


module.exports = User;