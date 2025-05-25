import { GameModal } from "../models/gamesModel.js";

// Controller to update game data using various MongoDB update operators
export const updateGames = async (req, res) => {
  try {
    let data;

    // 🔁 Set a new field `rolPlay` to "Yes" for all games with genre "RPG"
    // If `rolPlay` doesn't exist, it will be added
    // data = await GameModal.updateMany(
    //   { genre: { $eq: "RPG" } },
    //   { $set: { rolPlay: "Yes" } }
    // );

    // 🔁 Update or insert a game with title "TG"
    // - `upsert: true`: creates the document if not found
    // - `runValidators: true`: applies schema validation
    // - `new: true`: returns the updated document (not used here, but for findOneAndUpdate)
    // data = await GameModal.updateOne(
    //   { title: { $eq: "TG" } },
    //   { $set: { developer: "UBISOFT" } },
    //   { upsert: true, runValidators: true, new: true }
    // );

    // 🔁 Add an array as a single element
    // data = await GameModal.updateOne(
    //   { title: { $eq: "TG" } },
    //   { $push: { tags: { $each: ["RPG", "16-BIT"] } } } // pushes a nested array
    // );

    // ✅ Correct: add multiple elements to the `tags` array (no duplicates)
    // data = await GameModal.updateOne(
    //   { title: { $eq: "TG" } },
    //   { $addToSet: { tags: { $each: ["vSync", "4k60fps"] } } }
    // );

    // 🔁 Remove a specific tag from the `tags` array
    // data = await GameModal.updateOne(
    //   { title: { $eq: "TG" } },
    //   { $pull: { tags: "RPG" } }
    // );

    // 🔁 Cap ratings to a max value of 7 — any value >7 will be set to 7
    // data = await GameModal.updateMany({}, { $max: { rating: 7 } });

    // 🔁 Ensure all ratings are at least 5 — values <5 will stay unchanged
    // data = await GameModal.updateMany({}, { $min: { rating: 5 } });

    // 🔁 Rename field `rolPlay` to `npc` in all documents
    // data = await GameModal.updateMany({}, { $rename: { rolPlay: "npc" } });

    // 🔁 Multiply the `price` of all games by 2
    // data = await GameModal.updateMany({}, { $mul: { price: 2 } });

    return res.status(200).json({
      message: "Data updated successfully",
      data,
    });
  } catch (error) {
    res.status(500).send("❌ Failed to update: " + error.message);
  }
};
