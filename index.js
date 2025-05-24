import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import readController from "./controller/readController.js";

dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

const database = `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.j0brp9i.mongodb.net/sample_mflix`;

const dbConnection = async () => {
  try {
    await mongoose.connect(database);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};

dbConnection();

app.get("/read", readController);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
