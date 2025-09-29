const axios = require('axios');
require('dotenv').config();

// Only use the required fields for template API
async function sendWhatsAppMessage(data) {
  const BASE_URL = process.env.WA_API_BASE;
  const params = {
    LicenseNumber: process.env.LICENSE_NUMBER,
    APIKey: process.env.API_KEY,
    Contact: data.Contact,
    Template: data.Template || process.env.TEMPLATE,
    Param: data.Param || '' // Comma-separated values for template variables
  };
  const response = await axios.get(BASE_URL, { params });
  return response.data;
}

module.exports = sendWhatsAppMessage;
