const Candidate = require('../models/Candidate');

// Get all candidates across all elections
const getAllCandidates = async (req, res) => {
    try {
        const { party, search, page = 1, limit = 100 } = req.query;
        let query = {};

        if (party && party !== 'All') {
            query.party = { $regex: new RegExp(`^${party}$`, 'i') };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { constituency: { $regex: search, $options: 'i' } }
            ];
        }

        const candidates = await Candidate.find(query)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ name: 1 })
            .maxTimeMS(15000); // 15s DB timeout (Relaxed for Render)

        const total = await Candidate.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: candidates.length,
            total,
            candidates // Return the array the frontend expects
        });
    } catch (error) {
        console.error("Error fetching all candidates:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get candidates for a specific election
const getCandidates = async (req, res) => {
    try {
        const { electionId } = req.params;
        const candidates = await Candidate.find({ electionId });

        return res.status(200).json({
            success: true,
            data: candidates
        });
    } catch (error) {
        console.error("Error fetching election candidates:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCandidates,
    getAllCandidates
};
