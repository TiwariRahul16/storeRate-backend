const User = require("./User");
const Store = require("./Store");
const Rating = require("./Rating");

// ─── ASSOCIATIONS ─────────────────────────────────────────────
// A store_owner (User) can own many stores
User.hasMany(Store, { foreignKey: "owner_id", as: "ownedStores" });
Store.belongsTo(User, { foreignKey: "owner_id", as: "owner" });

// A user can rate many stores
User.hasMany(Rating, { foreignKey: "user_id", as: "ratings" });
Rating.belongsTo(User, { foreignKey: "user_id", as: "user" });

// A store can have many ratings
Store.hasMany(Rating, { foreignKey: "store_id", as: "ratings" });
Rating.belongsTo(Store, { foreignKey: "store_id", as: "store" });

module.exports = { User, Store, Rating };
