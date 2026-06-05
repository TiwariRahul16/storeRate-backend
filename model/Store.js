const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Store = sequelize.define(
    "Store",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(60),
            allowNull: false,
            validate: {
                notNull: { msg: "Store name is required" },
                notEmpty: { msg: "Store name cannot be empty" },
                len: {
                    args: [20, 60],
                    msg: "Store name must be between 20 and 60 characters",
                },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: { msg: "Store email already exists" },
            validate: {
                notNull: { msg: "Store email is required" },
                isEmail: { msg: "Please provide a valid email" },
            },
        },
        address: {
            type: DataTypes.STRING(400),
            allowNull: false,
            validate: {
                notNull: { msg: "Address is required" },
                notEmpty: { msg: "Address cannot be empty" },
                len: {
                    args: [1, 400],
                    msg: "Address cannot exceed 400 characters",
                },
            },
        },
        // owner_id FK added via association in index.js
    },
    {
        tableName: "stores",
        timestamps: true,
    }
);

module.exports = Store;
