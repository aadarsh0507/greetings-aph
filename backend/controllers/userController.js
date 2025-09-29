// controllers/patientController.js
const { getPatients } = require("../auth/mssqlConnect");

// Get patient by UHID
exports.fetchPatientByUHID = async (req, res) => {
  try {
    const { uhid } = req.params;

    if (!uhid) {
      return res.status(400).json({ 
        success: false,
        message: "UHID is required" 
      });
    }

    const patients = await getPatients({ uhid });
    const patient = patients[0] || null;

    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: "Patient not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
      message: "Patient found successfully"
    });
  } catch (error) {
    console.error('Error fetching patient by UHID:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch patient',
      message: error.message
    });
  }
};

// Get patients by exact DOB
exports.fetchPatientsByDOB = async (req, res) => {
  try {
    const { dob } = req.params;

    if (!dob) {
      return res.status(400).json({ 
        success: false,
        message: "Date of birth is required (format: YYYY-MM-DD)" 
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD" 
      });
    }

    const patients = await getPatients({ dob });

    res.status(200).json({
      success: true,
      data: patients,
      count: patients.length,
      message: `Found ${patients.length} patients with DOB ${dob}`
    });
  } catch (error) {
    console.error('Error fetching patients by DOB:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch patients by DOB',
      message: error.message
    });
  }
};

// Get patients with birthday today
exports.fetchPatientsWithBirthdayToday = async (req, res) => {
  try {
    const patients = await getPatients({ birthdayToday: true });

    res.status(200).json({
      success: true,
      data: patients,
      count: patients.length,
      message: `Found ${patients.length} patients with birthday today`
    });
  } catch (error) {
    console.error('Error fetching patients with birthday today:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch patients with birthday today',
      message: error.message
    });
  }
};

// Get patients with birthday tomorrow
exports.fetchPatientsWithBirthdayTomorrow = async (req, res) => {
  try {
    const patients = await getPatients({ birthdayTomorrow: true });

    res.status(200).json({
      success: true,
      data: patients,
      count: patients.length,
      message: `Found ${patients.length} patients with birthday tomorrow`
    });
  } catch (error) {
    console.error('Error fetching patients with birthday tomorrow:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch patients with birthday tomorrow',
      message: error.message
    });
  }
};

