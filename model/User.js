const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
    "User",
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
                notNull: { msg: "Name is required" },
                notEmpty: { msg: "Name cannot be empty" },
                len: {
                    args: [20, 60],
                    msg: "Name must be between 20 and 60 characters",
                },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: { msg: "Email already exists" },
            validate: {
                notNull: { msg: "Email is required" },
                isEmail: { msg: "Please provide a valid email" },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
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
        role: {
            type: DataTypes.ENUM("admin", "user", "store_owner"),
            defaultValue: "user",
            validate: {
                isIn: {
                    args: [["admin", "user", "store_owner"]],
                    msg: "Role must be admin, user, or store_owner",
                },
            },
        },
    },
    {
        tableName: "users",
        timestamps: true,
    }
);

module.exports = User;
