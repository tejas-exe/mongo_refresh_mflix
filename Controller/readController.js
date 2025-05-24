// 🎬🔍 MFlix Movies Collection Query Playground

const commonProjection = { _id: 0, title: 1 };

import { Movies } from "../models/models.js";

const readController = async (req, res) => {
  try {
    let data;

    // 📅🎥 Find movies released in the year 1999
    data = await Movies.find(
      { year: { $eq: 1999 } },
      { _id: 0, title: 1 }
    ).limit(10);

    // 😂🎥 Find movies with the genre “Comedy”
    data = await Movies.find(
      { genres: { $eq: "Comedy" } },
      { _id: 0, title: 1, genres: 1 }
    );

    // 🎯📄 Projection: only titles
    // 🔢 Limit to 10 movies
    // ⏩ Skip first 5
    // 🔤 Sort by title (A–Z)
    data = await Movies.find({}, { _id: 0, title: 1 })
      .limit(10)
      .skip(5)
      .sort({ title: 1 });

    // 🧭📚 Using Cursor in MongoDB (Mongoose)
    // 1️⃣ Fetch first 3 docs manually with `.next()`
    // 🔁 Then loop through the rest with `.forEach()`
    const cursor = Movies.find({}, commonProjection).limit(10).cursor();
    const doc1 = await cursor.next(); // 📄 First doc
    const doc2 = await cursor.next(); // 📄 Second doc
    const doc3 = await cursor.next(); // 📄 Third doc
    const results = [];

    await cursor.forEach((doc) => {
      results.push(doc); // 📦 Add to results
    });

    data = { doc1, doc2, doc3, results };

    // 🧮🔎 Query Operators in `.find()`

    // 📆📈 Movies with year >= 2000
    data = await Movies.find(
      { year: { $gte: 2000 } },
      { ...commonProjection, year: 1 }
    ).limit(10);

    // ⏱️📉 Movies with runtime <= 90 minutes
    data = await Movies.find(
      { runtime: { $lte: 90 } },
      { ...commonProjection, runtime: 1 }
    ).limit(10);

    // 🧠🔗 Logical Operators

    // 🔗 AND: runtime > 100 AND year < 2000
    data = await Movies.find(
      {
        $and: [{ runtime: { $gt: 100 } }, { year: { $lt: 2000 } }],
      },
      { ...commonProjection, runtime: 1, year: 1 }
    ).limit(10);

    // 🔀 OR: genre is Drama OR Action
    data = await Movies.find(
      { $or: [{ genres: "Drama" }, { genres: "Action" }] },
      { ...commonProjection, genres: 1 }
    ).limit(10);

    // 🧬🔎 Element Operators ($exists, $type)
    // ✅ Find movies that have a cast field
    data = await Movies.find(
      { cast: { $exists: true } },
      { ...commonProjection, cast: 1 }
    ).limit(10);

    // ✅ Find movies where the awards field is of type object
    data = await Movies.find(
      { awards: { $type: "object" } },
      { ...commonProjection, awards: 1 }
    ).limit(10);

    // 🔍🎯 Evaluation operators ($regex, $text)

    // 🔎 Find movies where the title contains “spider” (case insensitive)
    data = await Movies.find(
      {
        title: { $regex: "spider", $options: "i" },
      },
      commonProjection
    );

    // 🔤 How to perform a full text search on the plot field?
    data = await Movies.find(
      {
        $text: {
          $search:
            "A group of bandits stage a brazen train hold-up, only to find a determined posse hot on their heels.",
        },
      },
      { title: 1, score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    // 🚀📤 Send Response
    return res.status(200).json({
      message: "Data fetched successfully",
      data,
    });
  } catch (error) {
    // ❌🔥 Handle Errors
    return res.status(500).json({
      message: "Data fetching failed",
      error: error.message,
    });
  }
};

export default readController;
