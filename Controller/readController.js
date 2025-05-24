const readController = async (req, res) => {
    try {
        let data;



        
        res.status(200).json({
            message: "Data fetched successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            message: "Data fetching failed",
            error: error.message
        });
    }
};

export default readController;
