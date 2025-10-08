const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage, testWhatsAppAPI } = require('../controllers/sendWhatsAppController');

// POST /api/send-whatsapp
router.post('/', sendWhatsAppMessage);

// GET /api/send-whatsapp/test - Test WhatsApp API connectivity
router.get('/test', testWhatsAppAPI);

module.exports = router;
