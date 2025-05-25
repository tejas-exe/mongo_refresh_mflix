import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the Game Schema
const gameSchema = new Schema(
  {
    title: {
      type: String,
      required: true, // Title is mandatory
      trim: true,
    },
    genre: {
      type: String,
      enum: [
        "Action",
        "Adventure",
        "RPG",
        "Shooter",
        "Strategy",
        "Simulation",
        "Horror",
        "Sports",
      ], // Example genres
      required: true,
    },
    platform: {
      type: [String], // Array of platforms the game is available on
      enum: ["PC", "Xbox", "PlayStation", "Switch"],
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    developer: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0, // Rating out of 10
    },
    price: {
      type: Number, // Price in USD
      required: true,
    },
    imageUrl: {
      type: String, // URL for game poster or cover image
    },
    tags: {
      type: [String], // Tags for the game (e.g., "multiplayer", "single-player", "open-world")
      default: [],
    },
    systemRequirements: {
      os: {
        type: String,
        required: true,
      },
      processor: {
        type: String,
        required: true,
      },
      memory: {
        type: String, // E.g., "8GB RAM"
        required: true,
      },
      graphics: {
        type: String,
        required: true,
      },
      storage: {
        type: String, // E.g., "50GB"
        required: true,
      },
    },
  },
  { strict: false }
);

// Create a model from the schema
export const GameModal = mongoose.model("Game", gameSchema);
