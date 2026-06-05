const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const app = express();
    console.log(process.env.DB_PASSWORD);
    console.log(process.env.DB_NAME);
// ─── SECURITY MIDDLEWARES ──────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// ─── BODY PARSERS ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── LOGGER ───────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Store Rating API is running",
        data: null,
    });
});

// ─── ROUTES ───────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/owner", ownerRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null,
  });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
