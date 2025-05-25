import { Movies } from "../models/models.js";

// 🎯 Controller to demonstrate performance difference between indexed and non-indexed queries
export const indexing = async (req, res) => {
    try {
        // 🗑️ STEP 1: Drop the compound index if it exists
        // NOTE: You should NOT use `dropSearchIndex`. Instead, use `dropIndex` with the exact index spec or name
        await Movies.collection.dropIndex({ year: -1, "imdb.rating": -1 }).catch(() => { });

        // 🧪 STEP 2: Run query WITHOUT index and capture execution time
        const nonIndexFind = await Movies.find({})
            .sort({ year: -1, "imdb.rating": -1 })
            .limit(5)
            .explain("executionStats");

        // ✅ STEP 3: Create compound index manually (ideally done in schema or separate setup script)
        await Movies.collection.createIndex({ year: -1, "imdb.rating": -1 });

        // 🧪 STEP 4: Run the same query WITH index and capture execution time
        const indexFind = await Movies.find({})
            .sort({ year: -1, "imdb.rating": -1 })
            .limit(5)
            .explain("executionStats");

        // 📊 STEP 5: Return execution times for comparison
        return res.status(200).json({
            nonIndexedQueryTime: nonIndexFind.executionStats.executionTimeMillis,
            indexedQueryTime: indexFind.executionStats.executionTimeMillis,
        });
    } catch (error) {
        return res.status(500).json({
            message: "❌ Failed to test indexing performance",
            error: error.message,
        });
    }
};
