const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

// load models + associations
const { connectDB } = require("./config/db");
const { User, Store, Rating } = require("./model/index");

// ─── SEED DATA ─────────────────────────────────────────────────────────────

const users = [
    // ── Admin ──────────────────────────────────────────────────────────────
    {
        name: "System Administrator User",
        email: "admin@ratestore.com",
        password: "Admin@123",
        address: "Admin Office, 45 Main Street, Downtown, New York",
        role: "admin",
    },

    // ── Store Owners ────────────────────────────────────────────────────────
    {
        name: "Rajesh Kumar Sharma Store Owner",
        email: "rajesh@ratestore.com",
        password: "Owner@123",
        address: "12 MG Road, Bangalore, Karnataka, India",
        role: "store_owner",
    },
    {
        name: "Priya Mehta Electronics Shop Owner",
        email: "priya@ratestore.com",
        password: "Owner@123",
        address: "88 Linking Road, Bandra West, Mumbai, India",
        role: "store_owner",
    },
    {
        name: "Arjun Patel Grocery Store Manager",
        email: "arjun@ratestore.com",
        password: "Owner@123",
        address: "24 CG Road, Ahmedabad, Gujarat, India",
        role: "store_owner",
    },

    // ── Normal Users ────────────────────────────────────────────────────────
    {
        name: "Sneha Joshi Regular Platform User",
        email: "sneha@ratestore.com",
        password: "User@1234",
        address: "56 Koregaon Park, Pune, Maharashtra, India",
        role: "user",
    },
    {
        name: "Amit Singh Active Customer Account",
        email: "amit@ratestore.com",
        password: "User@1234",
        address: "33 Salt Lake City, Kolkata, West Bengal, India",
        role: "user",
    },
    {
        name: "Neha Verma Verified Customer User",
        email: "neha@ratestore.com",
        password: "User@1234",
        address: "77 Anna Nagar, Chennai, Tamil Nadu, India",
        role: "user",
    },
];

const stores = [
    {
        name: "Rajesh Kumar Electronics and Gadgets Hub",
        email: "rajesh.store@ratestore.com",
        address: "12 MG Road, Bangalore, Karnataka, India",
        ownerEmail: "rajesh@ratestore.com",
    },
    {
        name: "Priya Mehta Fashion and Lifestyle Boutique",
        email: "priya.store@ratestore.com",
        address: "88 Linking Road, Bandra West, Mumbai, India",
        ownerEmail: "priya@ratestore.com",
    },
    {
        name: "Arjun Patel Fresh Grocery and Supermarket",
        email: "arjun.store@ratestore.com",
        address: "24 CG Road, Ahmedabad, Gujarat, India",
        ownerEmail: "arjun@ratestore.com",
    },
];

// ratings[i] = { userEmail, storeEmail, rating }
const ratings = [
    { userEmail: "sneha@ratestore.com",  storeEmail: "rajesh.store@ratestore.com", rating: 5 },
    { userEmail: "sneha@ratestore.com",  storeEmail: "priya.store@ratestore.com",  rating: 4 },
    { userEmail: "amit@ratestore.com",   storeEmail: "rajesh.store@ratestore.com", rating: 3 },
    { userEmail: "amit@ratestore.com",   storeEmail: "arjun.store@ratestore.com",  rating: 5 },
    { userEmail: "neha@ratestore.com",   storeEmail: "priya.store@ratestore.com",  rating: 4 },
    { userEmail: "neha@ratestore.com",   storeEmail: "arjun.store@ratestore.com",  rating: 2 },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

const hashPassword = async (plain) => bcrypt.hash(plain, 12);

const log = {
    info:    (msg) => console.log(`  ℹ  ${msg}`),
    success: (msg) => console.log(`  ✓  ${msg}`),
    warn:    (msg) => console.log(`  ⚠  ${msg}`),
    section: (msg) => console.log(`\n── ${msg} ${"─".repeat(40 - msg.length)}`),
};

// ─── SEED FUNCTION ───────────────────────────────────────────────────────────

const seed = async () => {
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║           RateStore  Seed Script         ║");
    console.log("╚══════════════════════════════════════════╝");

    await connectDB();

    // ── 1. Users ────────────────────────────────────────────────────────────
    log.section("Seeding Users");

    const createdUsers = {};   // email → User instance

    for (const u of users) {
        const existing = await User.findOne({ where: { email: u.email } });
        if (existing) {
            log.warn(`Skipped (already exists): ${u.email}`);
            createdUsers[u.email] = existing;
            continue;
        }

        const hashed = await hashPassword(u.password);
        // validate: false — skips the password regex check on the hashed string
        const user = await User.create({ ...u, password: hashed }, { validate: false });
        createdUsers[u.email] = user;
        log.success(`Created ${u.role.padEnd(12)} → ${u.email}  (password: ${u.password})`);
    }

    // ── 2. Stores ────────────────────────────────────────────────────────────
    log.section("Seeding Stores");

    const createdStores = {};  // email → Store instance

    for (const s of stores) {
        const existing = await Store.findOne({ where: { email: s.email } });
        if (existing) {
            log.warn(`Skipped (already exists): ${s.email}`);
            createdStores[s.email] = existing;
            continue;
        }

        const owner = createdUsers[s.ownerEmail];
        if (!owner) {
            log.warn(`Owner not found for store ${s.name}, skipping`);
            continue;
        }

        const store = await Store.create({
            name:     s.name,
            email:    s.email,
            address:  s.address,
            owner_id: owner.id,
        });
        createdStores[s.email] = store;
        log.success(`Created store → "${s.name}"`);
    }

    // ── 3. Ratings ────────────────────────────────────────────────────────────
    log.section("Seeding Ratings");

    for (const r of ratings) {
        const user  = createdUsers[r.userEmail];
        const store = createdStores[r.storeEmail];

        if (!user || !store) {
            log.warn(`Skipped rating — user or store not found`);
            continue;
        }

        const existing = await Rating.findOne({
            where: { user_id: user.id, store_id: store.id },
        });
        if (existing) {
            log.warn(`Skipped rating (already exists): ${r.userEmail} → ${r.storeEmail}`);
            continue;
        }

        await Rating.create({ user_id: user.id, store_id: store.id, rating: r.rating });
        log.success(`Rating ${r.rating}⭐  ${r.userEmail} → ${r.storeEmail}`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║              Seed Complete!              ║");
    console.log("╠══════════════════════════════════════════╣");
    console.log("║  Role          Email             Password ║");
    console.log("╠══════════════════════════════════════════╣");
    console.log("║  admin         admin@ratestore.com       ║");
    console.log("║                password: Admin@123       ║");
    console.log("╠══════════════════════════════════════════╣");
    console.log("║  store_owner   rajesh@ratestore.com      ║");
    console.log("║  store_owner   priya@ratestore.com       ║");
    console.log("║  store_owner   arjun@ratestore.com       ║");
    console.log("║                password: Owner@123       ║");
    console.log("╠══════════════════════════════════════════╣");
    console.log("║  user          sneha@ratestore.com       ║");
    console.log("║  user          amit@ratestore.com        ║");
    console.log("║  user          neha@ratestore.com        ║");
    console.log("║                password: User@1234       ║");
    console.log("╚══════════════════════════════════════════╝\n");

    process.exit(0);
};

seed().catch((err) => {
    console.error("\n✗ Seed failed:", err.message);
    process.exit(1);
});