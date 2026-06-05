const { Store, Rating, User } = require("../model/index");
const AppError = require("../utils/AppError");

// GET /api/v1/owner/dashboard
// store_owner — see list of users who rated their store + avg rating
const getOwnerDashboard = async (req, res, next) => {
    try {
        const ownerId = req.user.id;

        // find the store owned by this user
        const store = await Store.findOne({
            where: { owner_id: ownerId },
            include: [
                {
                    model: Rating,
                    as: "ratings",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "name", "email"],
                        },
                    ],
                },
            ],
        });

        if (!store) {
            return next(new AppError("No store found for this owner", 404));
        }

        const ratings = store.ratings;

        const avgRating =
            ratings.length > 0
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                : null;

        const ratersList = ratings.map((r) => ({
            userId: r.user.id,
            name: r.user.name,
            email: r.user.email,
            rating: r.rating,
            ratedAt: r.createdAt,
        }));

        res.status(200).json({
            success: true,
            message: "Owner dashboard fetched successfully",
            data: {
                store: {
                    id: store.id,
                    name: store.name,
                    email: store.email,
                    address: store.address,
                },
                averageRating: avgRating,
                totalRatings: ratings.length,
                raters: ratersList,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getOwnerDashboard };
