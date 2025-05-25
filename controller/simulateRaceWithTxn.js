// controllers/orderController.js
import mongoose from "mongoose";
import { ProductModel, OrderModel } from "../models/transactionModels.js";

// 🧪 Endpoint to simulate race condition using transactions
export const simulateRaceConditionTxn = async (req, res) => {
  const { productId, quantity } = req.body;

  // 🛠️ Function to place an order inside a transaction
  const placeOrderTxn = async () => {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const product = await ProductModel.findById(productId).session(session);
        if (!product) throw new Error("Product not found");

        // Check stock
        if (product.stock < quantity) throw new Error("Stock too low");

        product.stock -= quantity;
        await product.save({ session });

        const order = new OrderModel({
          productId,
          quantity,
          totalPrice: product.price * quantity,
        });
        await order.save({ session });
      });
    } catch (err) {
      throw err;
    } finally {
      await session.endSession();
    }
  };

  try {
    // 🔁 Trigger two concurrent order requests
    const results = await Promise.allSettled([
      placeOrderTxn(),
      placeOrderTxn(),
    ]);

    res.status(200).json({
      message: "🎯 Race simulation complete",
      results,
    });
  } catch (err) {
    res.status(500).json({
      message: "❌ Simulation failed",
      error: err.message,
    });
  }
};
