const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { connectDB } = require("./config/db");


// load model associations before DB sync
require("./model/index");


const PORT = process.env.PORT || 3000;

const server = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(`Failed to start server with error: ${error.message}`);
        process.exit(1);
    }
};

server();
