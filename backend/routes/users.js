const express = require('express');
const router = express.Router();
const {
  fetchPatientByUHID,
  fetchPatientsByDOB,
  fetchPatientsWithBirthdayToday,
  fetchPatientsWithBirthdayTomorrow
} = require('../controllers/userController');

// Patient routes
router.get('/uhid/:uhid', fetchPatientByUHID);
router.get('/dob/:dob', fetchPatientsByDOB);
router.get('/birthday/today', fetchPatientsWithBirthdayToday);
router.get('/birthday/tomorrow', fetchPatientsWithBirthdayTomorrow);

module.exports = router;