const electionRepository = require('../repositories/electionRepository');

const getActiveElection = async (req, res) => {
  try {
    const election = await electionRepository.getActiveElection();
    if (!election) {
      return res.status(200).json({ success: true, title: 'No active election', id: null });
    }
    // Remote might expect the election directly or wrapped in data
    res.json(election);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active election' });
  }
};

const getElections = async (req, res) => {
  try {
    const elections = await electionRepository.findAll();
    res.json({ 
      success: true, 
      elections: elections,
      data: elections // Backward compatibility with remote expectation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
};

const createElection = async (req, res) => {
  try {
    const election = await electionRepository.create(req.body);
    res.status(201).json({ success: true, election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create election' });
  }
};

const updateElectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const election = await electionRepository.updateStatus(id, status);
    res.json({ success: true, election });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update election status' });
  }
};

module.exports = {
  getActiveElection,
  getElections,
  createElection,
  updateElectionStatus
};
