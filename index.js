import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// 🌐 Controllers
import readController from "./controller/readController.js";
import aggregationController from "./controller/aggregationController.js";
import {
  manualTransaction,
  placeOrder,
  restockInventoryWithoutTransaction,
  restockInventoryWithTransaction,
} from "./controller/transactionController.js";
import { simulateRaceConditionTxn } from "./controller/simulateRaceWithTxn.js";
import { updateGames } from "./controller/updateController.js";

// 📦 Load environment variables
dotenv.config();

// 🔧 Express app setup
const app = express();
app.use(express.json());
const port = 3000;

// 🔌 MongoDB Connection URI
const database = `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.j0brp9i.mongodb.net/sample_mflix`;

// ---------------------------------------------------------------------------
// 🧩 Connect to MongoDB
// ---------------------------------------------------------------------------
const dbConnection = async () => {
  try {
    await mongoose.connect(database);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

dbConnection();

// ---------------------------------------------------------------------------
// 🔁 Inventory Management Endpoints (Create/Transactions)
// ---------------------------------------------------------------------------
app.post("/restockInventoryWithTransaction", restockInventoryWithTransaction);
app.post(
  "/restockInventoryWithoutTransaction",
  restockInventoryWithoutTransaction
);
app.post("/placeOrder", placeOrder);
app.post("/manualTransaction", manualTransaction);
app.post("/simulate-race-txn", simulateRaceConditionTxn);

// ---------------------------------------------------------------------------
// 🔁  (Update)
// ---------------------------------------------------------------------------
app.patch("/update", updateGames);
// ---------------------------------------------------------------------------
// 📖 Read & Aggregation Endpoints
// ---------------------------------------------------------------------------
app.get("/read", readController);
app.get("/aggregate", aggregationController);

// ---------------------------------------------------------------------------
// 🚀 Start Server
// ---------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
