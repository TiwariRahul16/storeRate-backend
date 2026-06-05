const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { User, Store, Rating } = require("../model/index");
const AppError = require("../utils/AppError");

// GET /api/v1/admin/dashboard
const getDashboard = async (req, res, next) => {
    try {
        const totalUsers = await User.count();
        const totalStores = await Store.count();
        const totalRatings = await Rating.count();

        res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: { totalUsers, totalStores, totalRatings },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/admin/users  — admin can add user, admin, or store_owner
const addUser = async (req, res, next) => {
    try {
        const { name, email, password, address, role } = req.body;

        if (!name || !email || !password || !address || !role) {
            return next(new AppError("Please provide name, email, password, address and role", 400));
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({ name, email, password: hashedPassword, address, role });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/admin/users?name=&email=&address=&role=&sortBy=name&order=ASC
const getAllUsers = async (req, res, next) => {
    try {
        const { name, email, address, role, sortBy = "createdAt", order = "DESC" } = req.query;

        const where = {};

        if (name) where.name = { [Op.iLike]: `%${name}%` };
        if (email) where.email = { [Op.iLike]: `%${email}%` };
        if (address) where.address = { [Op.iLike]: `%${address}%` };
        if (role) where.role = role;

        const allowedSort = ["name", "email", "address", "role", "createdAt"];
        const sortField = allowedSort.includes(sortBy) ? sortBy : "createdAt";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        const users = await User.findAll({
            where,
            attributes: { exclude: ["password"] },
            order: [[sortField, sortOrder]],
        });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/admin/users/:id
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        let responseData = {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
        };

        // if store_owner — also include average rating of their store
        if (user.role === "store_owner") {
            const store = await Store.findOne({
                where: { owner_id: id },
                include: [
                    {
                        model: Rating,
                        as: "ratings",
                        attributes: ["rating"],
                    },
                ],
            });

            if (store) {
                const ratings = store.ratings;
                const avgRating =
                    ratings.length > 0
                        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                        : null;

                responseData.store = {
                    id: store.id,
                    name: store.name,
                    averageRating: avgRating,
                };
            }
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/admin/stores
const addStore = async (req, res, next) => {
    try {
        const { name, email, address, owner_id } = req.body;

        if (!name || !email || !address) {
            return next(new AppError("Please provide name, email and address", 400));
        }

        // if owner_id provided, verify it's a store_owner
        if (owner_id) {
            const owner = await User.findByPk(owner_id);
            if (!owner) return next(new AppError("Owner not found", 404));
            if (owner.role !== "store_owner") {
                return next(new AppError("Assigned owner must have store_owner role", 400));
            }
        }

        const store = await Store.create({ name, email, address, owner_id: owner_id || null });

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            data: store,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/admin/stores?name=&email=&address=&sortBy=name&order=ASC
const getAllStores = async (req, res, next) => {
    try {
        const { name, email, address, sortBy = "createdAt", order = "DESC" } = req.query;

        const where = {};
        if (name) where.name = { [Op.iLike]: `%${name}%` };
        if (email) where.email = { [Op.iLike]: `%${email}%` };
        if (address) where.address = { [Op.iLike]: `%${address}%` };

        const allowedSort = ["name", "email", "address", "createdAt"];
        const sortField = allowedSort.includes(sortBy) ? sortBy : "createdAt";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        const stores = await Store.findAll({
            where,
            include: [
                {
                    model: Rating,
                    as: "ratings",
                    attributes: ["rating"],
                },
            ],
            order: [[sortField, sortOrder]],
        });

        // calculate avg rating for each store
        const storesWithRating = stores.map((store) => {
            const ratings = store.ratings;
            const avgRating =
                ratings.length > 0
                    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                    : null;

            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                averageRating: avgRating,
                totalRatings: ratings.length,
            };
        });

        res.status(200).json({
            success: true,
            message: "Stores fetched successfully",
            count: storesWithRating.length,
            data: storesWithRating,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboard, addUser, getAllUsers, getUserById, addStore, getAllStores };
