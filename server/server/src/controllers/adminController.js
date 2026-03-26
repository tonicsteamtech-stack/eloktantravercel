const Manifesto = require('../models/Manifesto');
const AuditLog = require('../models/AuditLog');
const BoothOfficer = require('../models/BoothOfficer');
const PromiseModel = require('../models/Promise');

// Manifesto Controllers
exports.getManifestos = async (req, res) => {
  try {
    const query = {};
    if (req.query.candidateId) query.candidateId = req.query.candidateId;
    if (req.query.electionId) query.electionId = req.query.electionId;
    
    const manifestos = await Manifesto.find(query)
      .populate('candidateId', 'name photo_url partyId')
      .sort({ createdAt: -1 });
    res.json({ success: true, manifestos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createOrUpdateManifesto = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    let manifesto;
    if (id) {
      manifesto = await Manifesto.findByIdAndUpdate(id, data, { new: true });
    } else {
      manifesto = await Manifesto.create(data);
    }
    res.status(201).json({ success: true, manifesto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteManifesto = async (req, res) => {
  try {
    await Manifesto.findByIdAndDelete(req.query.id);
    res.json({ success: true, message: 'Manifesto deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Promise Controllers
exports.getPromises = async (req, res) => {
    try {
      const query = {};
      if (req.query.candidateId) query.candidateId = req.query.candidateId;
      if (req.query.status) query.status = req.query.status;
      
      const promises = await PromiseModel.find(query)
        .populate('candidateId', 'name party')
        .sort({ createdAt: -1 });
      res.json({ success: true, promises });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  exports.createOrUpdatePromise = async (req, res) => {
    try {
      const { id, ...data } = req.body;
      let promise;
      if (id) {
        promise = await PromiseModel.findByIdAndUpdate(id, data, { new: true });
      } else {
        promise = await PromiseModel.create(data);
      }
      res.status(201).json({ success: true, promise });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  exports.deletePromise = async (req, res) => {
    try {
      await PromiseModel.findByIdAndDelete(req.query.id);
      res.json({ success: true, message: 'Promise deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

// Audit Log Controllers
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.create(req.body);
    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Booth Officer Controllers
exports.getBoothOfficers = async (req, res) => {
  try {
    const officers = await BoothOfficer.find().sort({ name: 1 });
    res.json({ success: true, officers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createOrUpdateBoothOfficer = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    let officer;
    if (id) {
      officer = await BoothOfficer.findByIdAndUpdate(id, data, { new: true });
    } else {
      officer = await BoothOfficer.create(data);
    }
    res.status(201).json({ success: true, officer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteBoothOfficer = async (req, res) => {
  try {
    await BoothOfficer.findByIdAndDelete(req.query.id);
    res.json({ success: true, message: 'Officer removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
