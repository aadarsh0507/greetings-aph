
const sendWhatsApp = require('../models/sendWhatsApp');
const addContact = require('../models/addContact');

// Controller to handle WhatsApp message sending
exports.sendWhatsAppMessage = async (req, res) => {
  try {
    const { patients } = req.body;
    if (!Array.isArray(patients) || patients.length === 0) {
      return res.status(400).json({ success: false, error: 'No patients provided' });
    }
    const results = [];
    for (const patient of patients) {
      try {
        // Add contact before sending WhatsApp message
        const addContactResult = await addContact({
          Contact: patient.Contact,
          Name: patient.Param, // patient.Param is the name
          Tag: patient.Tag // optional tag
        });
        console.log('Add Contact API response:', addContactResult);
        const result = await sendWhatsApp(patient);
        console.log('WhatsApp API response:', result);
        // Mark as failed if ApiResponse contains an error message
        if (result && typeof result.ApiResponse === 'string' && result.ApiResponse.toLowerCase().includes('invalid')) {
          results.push({ patient, addContactResult, result, success: false, error: result.ApiResponse });
        } else {
          results.push({ patient, addContactResult, result, success: true });
        }
      } catch (err) {
        console.error('WhatsApp API error:', err.message);
        results.push({ patient, error: err.message, success: false });
      }
    }
    // If any failed, set overall success to false
    const anyFailed = results.some(r => !r.success);
    res.json({ success: !anyFailed, message: 'WhatsApp messages processed', results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to send WhatsApp message' });
  }
};
