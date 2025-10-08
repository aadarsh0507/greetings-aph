
const sendWhatsApp = require('../models/sendWhatsApp');
const addContact = require('../models/addContact');
const axios = require('axios');

// Controller to handle WhatsApp message sending
exports.sendWhatsAppMessage = async (req, res) => {
  try {
    const { patients } = req.body;
    console.log('Received WhatsApp request:', JSON.stringify(req.body, null, 2));
    
    if (!Array.isArray(patients) || patients.length === 0) {
      return res.status(400).json({ success: false, error: 'No patients provided' });
    }

    // Check if required environment variables are set
    const requiredEnvVars = ['WA_API_BASE', 'LICENSE_NUMBER', 'API_KEY', 'TEMPLATE'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      return res.status(500).json({ 
        success: false, 
        error: `Missing required environment variables: ${missingEnvVars.join(', ')}. Please configure your .env file.` 
      });
    }

    const results = [];
    for (const patient of patients) {
      try {
        console.log('Processing patient:', JSON.stringify(patient, null, 2));
        
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
        } else if (result && result.error) {
          results.push({ patient, addContactResult, result, success: false, error: result.error });
        } else {
          results.push({ patient, addContactResult, result, success: true });
        }
      } catch (err) {
        console.error('WhatsApp API error for patient:', patient, 'Error:', err.message);
        results.push({ patient, error: err.message, success: false });
      }
    }
    
    // If any failed, set overall success to false
    const anyFailed = results.some(r => !r.success);
    console.log('Final results:', JSON.stringify(results, null, 2));
    
    res.json({ success: !anyFailed, message: 'WhatsApp messages processed', results });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send WhatsApp message' });
  }
};

// Test WhatsApp API connectivity
exports.testWhatsAppAPI = async (req, res) => {
  try {
    const BASE_URL = process.env.WA_API_BASE;
    
    if (!BASE_URL) {
      return res.status(500).json({
        success: false,
        error: 'WA_API_BASE not configured in environment variables'
      });
    }

    console.log('Testing WhatsApp API connectivity to:', BASE_URL);
    
    // Test basic connectivity
    const testResponse = await axios.get(BASE_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'APH-Greetings-App/1.0'
      },
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });

    res.json({
      success: true,
      message: 'WhatsApp API is reachable',
      status: testResponse.status,
      data: testResponse.data
    });

  } catch (error) {
    console.error('WhatsApp API Test Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: {
        message: error.message,
        code: error.code,
        response: error.response?.data || null,
        status: error.response?.status || null
      }
    });
  }
};
