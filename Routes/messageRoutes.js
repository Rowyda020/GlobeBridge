const express = require('express');
const router = express.Router();
const { auth } = require('../Middleware/auth')
const { sendMessage, getMessages, markMessagesAsRead } = require('../Controllers/messageController');

// Debug
console.log('sendMessage:', sendMessage);
console.log('getMessages:', getMessages);
console.log('markMessagesAsRead:', markMessagesAsRead);

// Message Routes
router.post('/messages', auth, sendMessage);
router.get('/messages/:userId', auth, getMessages);
router.put('/messages/read/:senderId', auth, markMessagesAsRead);

module.exports = router;