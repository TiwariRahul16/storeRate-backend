const express = require("express");
const {
    getDashboard,
    addUser,
    getAllUsers,
    getUserById,
    addStore,
    getAllStores,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// all admin routes are protected + restricted to admin role
router.use(protect, restrictTo("admin"));

router.get("/dashboard", getDashboard);

router.route("/users").get(getAllUsers).post(addUser);
router.get("/users/:id", getUserById);

router.route("/stores").get(getAllStores).post(addStore);

module.exports = router;
