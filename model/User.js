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
            validate: {
                notNull: { msg: "Password is required" },
                // custom validator: 8-16 chars, 1 uppercase, 1 special char
                isValidPassword(value) {
                    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
                    if (!regex.test(value)) {
                        throw new Error(
                            "Password must be 8-16 characters with at least one uppercase letter and one special character"
                        );
                    }
                },
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
