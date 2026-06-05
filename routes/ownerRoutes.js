const express = require("express");
const { getOwnerDashboard } = require("../controllers/ownerController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// all owner routes protected + restricted to store_owner role
router.use(protect, restrictTo("store_owner"));

router.get("/dashboard", getOwnerDashboard);

module.exports = router;
