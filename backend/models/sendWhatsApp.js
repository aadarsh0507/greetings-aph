const axios = require('axios');
require('dotenv').config();

// Only use the required fields for template API
async function sendWhatsAppMessage(data) {
  try {
    const BASE_URL = process.env.WA_API_BASE;
    
    // Check if required environment variables are set
    if (!BASE_URL || !process.env.LICENSE_NUMBER || !process.env.API_KEY || !process.env.TEMPLATE) {
      throw new Error('WhatsApp API configuration is incomplete. Please check your .env file.');
    }
    
    // Ensure proper WhatsApp format: remove + but keep country code
    let contactNumber = data.Contact;
    if (contactNumber && contactNumber.startsWith('+')) {
      contactNumber = contactNumber.substring(1); // Remove + sign
    }
    
    const params = {
      LicenseNumber: process.env.LICENSE_NUMBER,
      APIKey: process.env.API_KEY,
      Contact: contactNumber, // Format: 919791591976 (no + sign)
      Template: data.Template || process.env.TEMPLATE,
      Param: data.Param || '' // Comma-separated values for template variables
    };
    if (process.env.TAG) {
      params.Tag = process.env.TAG;
    }
    
    console.log('WhatsApp Contact Formatting:');
    console.log('Original Contact:', data.Contact);
    console.log('Formatted Contact:', contactNumber);
    console.log('WhatsApp API Params:', JSON.stringify(params, null, 2));
    
    // Add timeout and better error handling
    const response = await axios.get(BASE_URL, { 
      params,
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'APH-Greetings-App/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Add SSL/TLS configuration for better compatibility
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false // Allow self-signed certificates
      })
    });
    
    console.log('WhatsApp API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
    
  } catch (error) {
    console.error('WhatsApp API Error:', error.message);
    
    // Handle specific error types
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to WhatsApp API. Please check your API endpoint and network connection.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('WhatsApp API endpoint not found. Please check your WA_API_BASE URL.');
    } else if (error.response) {
      // API returned an error response
      throw new Error(`WhatsApp API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from WhatsApp API. Please check your network connection and API credentials.');
    } else {
      // Something else happened
      throw new Error(`WhatsApp API error: ${error.message}`);
    }
  }
}

module.exports = sendWhatsAppMessage;
