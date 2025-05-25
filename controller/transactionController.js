import mongoose from "mongoose";
import { OrderModel, ProductModel } from "../models/transactionModels.js";

//
// 🔧 Sample Project: Inventory Management System (MongoDB + Transactions)
// ----------------------------------------------------------------------
// 📌 Features:
// 1. Restock inventory (with and without transaction)
// 2. Place order with stock deduction (transactional)
// 3. Manual transaction with multiple collections
//

// -------------------------------------------------------------------------
// ✅ 1. Restock Inventory WITH Transaction
// -------------------------------------------------------------------------
// - Inserts multiple products into inventory atomically
// - If any insert fails, all operations are rolled back
//
export const restockInventoryWithTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  const { products } = req.body;

  try {
    await session.withTransaction(async () => {
      await ProductModel.insertMany(products, {
        session, // Bind to transaction session
        writeConcern: {
          w: "majority", // Wait for majority acknowledgement
          j: true, // Journal the write for durability
          wtimeout: 5000, // Timeout for write concern
        },
      });
    });

    res.status(200).json({
      message: "✅ Inventory restocked successfully (with transaction)",
    });
  } catch (err) {
    res.status(500).json({
      message: "❌ Restock failed (transaction)",
      error: err.message,
    });
  } finally {
    await session.endSession(); // Cleanup
  }
};

// -------------------------------------------------------------------------
// 🚫 2. Restock Inventory WITHOUT Transaction
// -------------------------------------------------------------------------
// - Simple insertMany without session
// - May result in partial data on failure
//
export const restockInventoryWithoutTransaction = async (req, res) => {
  const { products } = req.body;

  try {
    await ProductModel.insertMany(products); // No rollback on failure
    res.status(200).json({
      message: "✅ Inventory restocked successfully (without transaction)",
    });
  } catch (err) {
    res.status(500).json({
      message: "❌ Restock failed (no transaction)",
      error: err.message,
    });
  }
};

// -------------------------------------------------------------------------
// 🛒 3. Place Order WITH Transaction
// -------------------------------------------------------------------------
// - Decreases stock and creates order atomically
// - If stock is too low or order fails, rollback entire transaction
//
export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { prodName, qtt } = req.body;

    await session.withTransaction(async () => {
      // Find product by name
      const product = await ProductModel.findOne({ name: prodName }).session(
        session
      );
      if (!product) throw new Error("Product not found");

      // Calculate and create order
      const order = new OrderModel({
        productId: product._id,
        quantity: qtt,
        totalPrice: product.price * qtt,
      });
      await order.save({ session });

      // Reduce stock and validate
      product.stock -= qtt;
      if (product.stock < 0) {
        throw new Error("❌ Not enough stock available");
      }

      await product.save({ session });
    });

    res.status(200).json({
      message: "✅ Order placed successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "❌ Order failed",
      error: err.message,
    });
  } finally {
    await session.endSession(); // Cleanup
  }
};

// -------------------------------------------------------------------------
// 🧪 4. Manual Transaction Example (Multi-Collection Write)
// -------------------------------------------------------------------------
// - Example: Create user and address atomically
// - Good for complex business logic across collections
//
export const manualTransaction = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { name, email, address } = req.body;

    // Step 1: Create user
    const userCreated = await TestUser.create([{ name, email }], {
      session,
    });

    // Step 2: Create address linked to user
    await TestAddress.create(
      [
        {
          address,
          forUser: userCreated?._id || "",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.send("✅ Transaction successful");
  } catch (error) {
    await session.abortTransaction();
    console.log(error.message);
    res.status(500).send("❌ Error creating user or address");
  } finally {
    await session.endSession(); // Always end session
  }
};
