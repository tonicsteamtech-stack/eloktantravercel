const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Manifesto Routes
router.get('/manifesto', adminController.getManifestos);
router.post('/manifesto', adminController.createOrUpdateManifesto);
router.delete('/manifesto', adminController.deleteManifesto);

// Promise Routes
router.get('/promise', adminController.getPromises);
router.post('/promise', adminController.createOrUpdatePromise);
router.delete('/promise', adminController.deletePromise);

// Audit Routes
router.get('/audit', adminController.getAuditLogs);
router.post('/audit', adminController.createAuditLog);

// officer Routes
router.get('/officer', adminController.getBoothOfficers);
router.post('/officer', adminController.createOrUpdateBoothOfficer);
router.delete('/officer', adminController.deleteBoothOfficer);

module.exports = router;
