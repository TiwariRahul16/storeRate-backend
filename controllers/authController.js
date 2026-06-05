const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../model/index");
const AppError = require("../utils/AppError");

// helper — generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// POST /api/v1/auth/signup  — normal users only
const signup = async (req, res, next) => {
    try {
        const { name, email, password, address } = req.body;

        if (!name || !email || !password || !address) {
            return next(new AppError("Please provide name, email, password and address", 400));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            role: "user", // signup always creates normal user
        });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/auth/login  — all roles
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("Please provide email and password", 400));
        }

        // explicitly include password (it's excluded by default via select)
        const user = await User.findOne({
            where: { email },
            attributes: ["id", "name", "email", "address", "role", "password"],
        });

        if (!user) {
            return next(new AppError("Invalid email or password", 401));
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return next(new AppError("Invalid email or password", 401));
        }

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/auth/update-password  — all roles (protected)
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new AppError("Please provide current and new password", 400));
        }

        // fetch user with password
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "password"],
        });

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return next(new AppError("Current password is incorrect", 401));
        }

        // validate new password manually (since we're using update)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
        if (!passwordRegex.test(newPassword)) {
            return next(
                new AppError(
                    "Password must be 8-16 characters with at least one uppercase letter and one special character",
                    400
                )
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.update({ password: hashedPassword }, { where: { id: req.user.id } });

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { signup, login, updatePassword };
