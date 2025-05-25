import { Movies } from "../models/models.js";
import { Comments } from "../models/models.js";

const aggregationController = async (req, res) => {
  try {
    let data;

    // ❓ Q1: What are the latest 5 movies released in or after 2010?
    // 🎯 Match movies with year >= 2010
    // 📄 Show only title and year
    // 🔽 Sort by year (newest first)
    // 🔢 Limit to top 5
    data = await Movies.aggregate([
      { $match: { year: { $gte: 2010 } } },
      { $project: { _id: 0, title: 1, year: 1 } },
      { $sort: { year: -1 } },
      { $limit: 5 },
    ]);

    // ❓ Q2: Can we create a string like "Movie Title in the year 2020"?
    // 🧪 Use $concat and $toString to create a custom string
    // 🔢 Show only top 10 such strings
    data = await Movies.aggregate([
      {
        $project: {
          _id: 0,
          titleWithYear: {
            $concat: ["$title", " in the year ", { $toString: "$year" }],
          },
        },
      },
      { $limit: 10 },
    ]);

    // ❓ Q3: In which 5 years were the most movies released?
    // 📊 Group by year, count number of movies
    // 🔽 Sort descending and limit to top 5
    data = await Movies.aggregate([
      { $group: { _id: "$year", no_of_movies_released: { $sum: 1 } } },
      { $sort: { no_of_movies_released: -1 } },
      { $limit: 5 },
    ]);

    // ❓ Q4: Which genres have the highest average IMDb rating?
    // 📂 Unwind genres array
    // 📊 Group by genre and calculate:
    //    - average IMDb rating
    //    - total number of movies
    // 🧮 Round rating using $ceil
    data = await Movies.aggregate([
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          imdb_score: { $avg: "$imdb.rating" },
          totalMovies: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          imdb_score: { $ceil: "$imdb_score" },
          totalMovies: 1,
        },
      },
      { $sort: { imdb_score: -1 } },
    ]);

    // ❓ Q5: Who are the top 5 directors with the best average IMDb rating and runtime?
    // 🎬 Unwind directors
    // 📊 Group by director and calculate:
    //     - total movies
    //     - average IMDb rating
    //     - average watch time
    //     - list of movie titles
    // 🧾 Create a summary string with $concat
    data = await Movies.aggregate([
      { $unwind: "$directors" },
      {
        $group: {
          _id: "$directors",
          totalMovies: { $sum: 1 },
          movies: { $push: "$title" },
          averageMovieRating: { $avg: "$imdb.rating" },
          averageWatchTime: { $avg: "$runtime" },
        },
      },
      { $sort: { averageMovieRating: -1 } },
      { $limit: 5 },
      {
        $addFields: {
          summery: {
            $concat: [
              "the director ",
              { $toUpper: "$_id" },
              " with average runtime of ",
              { $toString: { $ceil: "$averageWatchTime" } },
              " with average rating of ",
              { $toString: { $round: ["$averageMovieRating", 2] } },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          movies: 1,
          totalMovies: 1,
          averageMovieRating: { $round: "$averageMovieRating" },
          summery: 1,
        },
      },
    ]);

    // ❓ Q6: Which 2 movies have the most comments?
    // 🔗 $lookup to join Comments with Movies
    // 🧵 Unwind joined movie info
    // 📊 Group by movie title, collect comments
    // 🔢 Count total comments
    data = await Comments.aggregate([
      {
        $lookup: {
          from: "movies",
          localField: "movie_id",
          foreignField: "_id",
          as: "movieDetails",
        },
      },
      { $unwind: "$movieDetails" },
      {
        $group: {
          _id: "$movieDetails.title",
          comments: { $push: "$text" },
          commentsCount: { $sum: 1 },
        },
      },
      { $project: { _id: 1, comments: 1, commentsCount: 1 } },
      { $sort: { commentsCount: -1 } },
      { $limit: 2 },
    ]);

    // ❓ Q7: What is the number of comments for top 5 most-commented movies?
    // 🔗 $lookup to join Comments with Movies
    // 📊 Group by movie title and count total comments
    data = await Comments.aggregate([
      {
        $lookup: {
          from: "movies",
          localField: "movie_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $group: {
          _id: "$movie.title",
          totalComments: { $sum: 1 },
        },
      },
      { $project: { _id: 1, totalComments: 1 } },
      { $sort: { totalComments: -1 } },
      { $limit: 5 },
    ]);

    // ❓ Q8: How many movies were released after the year 2010?
    // 🔢 Use $count after filtering by year
    data = await Movies.aggregate([
      { $match: { year: { $gte: 2010 } } },
      { $count: "totalMoviesAfter2010" },
    ]);

    // ❓ Q9: How many movies have the genre “Documentary”?
    // 📂 Unwind genres
    // 🎯 Match genre === "Documentary"
    // 🔢 Use $count to total
    data = await Movies.aggregate([
      { $unwind: "$genres" },
      { $match: { genres: "Documentary" } },
      { $count: "totalDocumentaryMovies" },
    ]);

    // 🎬🍿 MFlix Mega Aggregation Challenge 🤓🔥
    // 👨‍💻💾 Write an aggregation pipeline on the movies collection to:
    // 🎯 Filter the Movies:
    // 📅 Only movies released after 1990
    // 💬 Must have at least one comment in the comments collection
    // ⭐ IMDb rating >= 7
    // 🧮 For each qualifying movie, calculate:
    // 🎬 title, 🗓️ year, 🌟 imdb.rating
    // 🧮 totalComments — number of comments per movie
    // 🧑‍🎤 topCast — first 3 cast members 🎭🎭🎭
    // 🧠 isClassic — true if:
    // 🎞️ released before 2000 AND
    // 💬 more than 50 comments
    // 🧹 Sort & Limit:
    // 🔽 Sort by totalComments DESC, then imdb.rating DESC
    // ⛔ Limit to top 10 movies only
    // 🧾 Output only these fields:
    // 📽️ title
    // 📆 year
    // 📊 imdb.rating
    // 👥 topCast
    // 🧮 totalComments
    // 🏛️ isClassic
    // 💣🧠 This one’s a beast! Can you crack it? 😈💪
    // A1
    data = await Comments.aggregate([
      {
        $lookup: {
          from: "movies",
          localField: "movie_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $group: {
          _id: "$movie.title",
          totalComments: { $sum: 1 },
          year: { $first: "$movie.year" },
          imdbRating: { $first: "$movie.imdb.rating" },
          topCast: { $first: { $slice: ["$movie.cast", 3] } },
        },
      },
      {
        $addFields: {
          title: "$_id",
          isClassic: {
            $cond: {
              if: {
                $and: [
                  { $lt: ["$year", 2000] },
                  { $gt: ["$totalComments", 50] },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { year: { $gt: 1990 } },
            { imdbRating: { $gte: 7 } },
            { totalComments: { $gt: 1 } },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          totalComments: 1,
          year: 1,
          imdbRating: 1,
          topCast: 1,
          isClassic: 1,
        },
      },
      { $sort: { totalComments: -1, imdbRating: -1 } },
      { $limit: 10 },
    ]);
    // A2
    data = await Movies.aggregate([
      {
        $match: {
          year: { $gt: 1990 },
          "imdb.rating": { $gte: 7 },
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "movie_id",
          as: "movieComments",
        },
      },
      {
        $addFields: {
          totalComments: { $size: "$movieComments" },
        },
      },
      {
        $match: {
          totalComments: { $gt: 0 },
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          year: 1,
          "imdb.rating": 1,
          topCast: { $slice: ["$cast", 3] },
          totalComments: 1,
          isClassic: {
            $cond: {
              if: {
                $and: [
                  { $lt: ["$year", 2000] },
                  { $gt: ["$totalComments", 50] },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $sort: {
          totalComments: -1,
          "imdb.rating": -1,
        },
      },
      { $limit: 10 },
    ]);

    // 🚀📤 Final Response
    return res.status(200).json({
      message: "Data fetched successfully",
      data,
    });
  } catch (error) {
    // ❌🔥 Error Handling
    return res.status(500).json({
      message: "Data fetching failed",
      error: error.message,
    });
  }
};

export default aggregationController;
