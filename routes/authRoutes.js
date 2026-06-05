const express = require("express");
const { signup, login, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/update-password", protect, updatePassword);  // all roles

module.exports = router;
