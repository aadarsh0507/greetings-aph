const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../controllers/sendWhatsAppController');

// POST /api/send-whatsapp
router.post('/', sendWhatsAppMessage);

module.exports = router;
