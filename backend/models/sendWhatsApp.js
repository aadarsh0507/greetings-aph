const axios = require('axios');
require('dotenv').config();

// Only use the required fields for template API
async function sendWhatsAppMessage(data) {
  const BASE_URL = process.env.WA_API_BASE;
  
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
  
  const response = await axios.get(BASE_URL, { params });
  console.log('WhatsApp API Response:', JSON.stringify(response.data, null, 2));
  return response.data;
}

module.exports = sendWhatsAppMessage;
