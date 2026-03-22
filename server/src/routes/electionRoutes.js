const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');

router.get('/', electionController.getElections);
router.get('/active', electionController.getActiveElection);
router.post('/create', electionController.createElection);
router.patch('/:id/status', electionController.updateElectionStatus);

module.exports = router;
