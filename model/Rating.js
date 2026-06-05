const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Rating = sequelize.define(
    "Rating",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Rating is required" },
                min: { args: [1], msg: "Rating must be at least 1" },
                max: { args: [5], msg: "Rating cannot exceed 5" },
            },
        },
        // user_id and store_id FK added via associations in index.js
    },
    {
        tableName: "ratings",
        timestamps: true,
        indexes: [
            {
                // one rating per user per store
                unique: true,
                fields: ["user_id", "store_id"],
            },
        ],
    }
);

module.exports = Rating;
