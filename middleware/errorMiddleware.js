const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errMessage = err.message;
    const errStack = err.stack;

    console.error(errStack);

    // Sequelize unique constraint error
    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            success: false,
            message: err.errors[0]?.message || "Duplicate value",
            data: null,
        });
    }

    // Sequelize validation error
    if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
            success: false,
            message: err.errors.map((e) => e.message).join(", "),
            data: null,
        });
    }

    // JWT error
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please login again",
            data: null,
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired. Please login again",
            data: null,
        });
    }

    res.status(statusCode).json({
        success: false,
        message: errMessage || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? errStack : null,
        data: null,
    });
};

module.exports = errorHandler;
