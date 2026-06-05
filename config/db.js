const { Sequelize } = require("sequelize");

    console.log(process.env.DB_PASSWORD);
    console.log(process.env.DB_NAME);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL is connected");

        // sync all models — alter:true updates tables without dropping data
        await sequelize.sync({ alter: true });
        console.log("Database synced");
    } catch (error) {
        console.log(`Database connection failed with error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
