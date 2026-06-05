const express = require("express");
const { getAllStores, submitRating, updateRating } = require("../controllers/storeController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// all store routes are protected + restricted to normal user
router.use(protect, restrictTo("user"));

router.get("/", getAllStores);
router.post("/:id/rate", submitRating);
router.put("/:id/rate", updateRating);

module.exports = router;
