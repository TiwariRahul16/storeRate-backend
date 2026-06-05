const { Op } = require("sequelize");
const { Store, Rating, User } = require("../model/index");
const AppError = require("../utils/AppError");

// GET /api/v1/stores?name=&address=&sortBy=name&order=ASC
// normal user — list all stores with avg rating + their own submitted rating
const getAllStores = async (req, res, next) => {
    try {
        const { name, address, sortBy = "name", order = "ASC" } = req.query;

        const where = {};
        if (name) where.name = { [Op.iLike]: `%${name}%` };
        if (address) where.address = { [Op.iLike]: `%${address}%` };

        const allowedSort = ["name", "address", "createdAt"];
        const sortField = allowedSort.includes(sortBy) ? sortBy : "name";
        const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        const stores = await Store.findAll({
            where,
            include: [
                {
                    model: Rating,
                    as: "ratings",
                    attributes: ["rating", "user_id"],
                },
            ],
            order: [[sortField, sortOrder]],
        });

        const userId = req.user.id;

        const storesWithDetails = stores.map((store) => {
            const ratings = store.ratings;

            const avgRating =
                ratings.length > 0
                    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                    : null;

            const myRating = ratings.find((r) => r.user_id === userId);

            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                averageRating: avgRating,
                totalRatings: ratings.length,
                myRating: myRating ? myRating.rating : null,
            };
        });

        res.status(200).json({
            success: true,
            message: "Stores fetched successfully",
            count: storesWithDetails.length,
            data: storesWithDetails,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/stores/:id/rate  — submit a rating
const submitRating = async (req, res, next) => {
    try {
        const { id: store_id } = req.params;
        const { rating } = req.body;
        const user_id = req.user.id;

        if (!rating) {
            return next(new AppError("Please provide a rating", 400));
        }

        const store = await Store.findByPk(store_id);
        if (!store) {
            return next(new AppError("Store not found", 404));
        }

        // check if user already rated this store
        const existing = await Rating.findOne({ where: { user_id, store_id } });
        if (existing) {
            return next(new AppError("You have already rated this store. Use PUT to update", 409));
        }

        const newRating = await Rating.create({ user_id, store_id, rating });

        res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            data: newRating,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/stores/:id/rate  — update existing rating
const updateRating = async (req, res, next) => {
    try {
        const { id: store_id } = req.params;
        const { rating } = req.body;
        const user_id = req.user.id;

        if (!rating) {
            return next(new AppError("Please provide a rating", 400));
        }

        const store = await Store.findByPk(store_id);
        if (!store) {
            return next(new AppError("Store not found", 404));
        }

        const existing = await Rating.findOne({ where: { user_id, store_id } });
        if (!existing) {
            return next(new AppError("No rating found. Use POST to submit first", 404));
        }

        await Rating.update({ rating }, { where: { user_id, store_id } });

        res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            data: { user_id, store_id, rating },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllStores, submitRating, updateRating };
