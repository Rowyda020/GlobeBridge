const express = require('express');
const router = express.Router();
const { auth } = require('../Middleware/auth')
const { sendMessage, getMessages, markMessagesAsRead } = require('../Controllers/messageController');


router.post('/messages', auth, sendMessage);
router.get('/messages/:userId', auth, getMessages);
router.put('/messages/read/:senderId', auth, markMessagesAsRead);

module.exports = router;