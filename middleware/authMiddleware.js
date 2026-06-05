const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { User } = require("../model/index");

// protect — verifies JWT, attaches user to req
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new AppError("Not authorized. No token provided", 401));
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return next(new AppError("User no longer exists", 401));
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

// restrictTo — allows only specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You do not have permission to perform this action", 403)
            );
        }
        next();
    };
};

module.exports = { protect, restrictTo };
