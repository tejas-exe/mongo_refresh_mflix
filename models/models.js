import mongoose from "mongoose";

export const Movies = mongoose.model(
  "movies",
  new mongoose.Schema({}, { strict: false })
);

export const Comments = mongoose.model(
  "comments",
  new mongoose.Schema({}, { strict: false })
);

export const Users = mongoose.model(
  "users",
  new mongoose.Schema({}, { strict: false })
);

export const Theaters = mongoose.model(
  "theaters",
  new mongoose.Schema({}, { strict: false })
);

export const Sessions = mongoose.model(
  "sessions",
  new mongoose.Schema({}, { strict: false })
);
