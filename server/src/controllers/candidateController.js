const fs = require('fs');
const path = require('path');

const getCandidates = (req, res) => {
    try {
        const { electionId } = req.params;
        const { party, search, page = 1, limit = 10 } = req.query;
        
        // Map election name to file name
        const filename = `candidates_${electionId}.json`;
        const DATA_PATH = path.join(__dirname, '../data/', filename);

        if (!fs.existsSync(DATA_PATH)) {
            return res.status(404).json({
                success: false,
                message: `Candidate data for ${electionId} not found. Please run the scraper first.`
            });
        }

        const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
        let candidates = JSON.parse(rawData);

        // Filtering by party
        if (party) {
            candidates = candidates.filter(c => c.party.toLowerCase() === party.toLowerCase());
        }

        // Searching by name or constituency
        if (search) {
            const query = search.toLowerCase();
            candidates = candidates.filter(c => 
                c.name.toLowerCase().includes(query) || 
                c.constituency.toLowerCase().includes(query)
            );
        }

        // Pagination
        const total = candidates.length;
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        
        const paginatedData = candidates.slice(startIndex, endIndex);

        return res.status(200).json({
            success: true,
            count: paginatedData.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: paginatedData
        });

    } catch (error) {
        console.error("Error fetching candidates:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

module.exports = {
    getCandidates
};
