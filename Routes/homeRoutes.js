const express = require('express');
const router = express.Router();
const { getLatestPosts } = require('../Controllers/homeController');


router.get('/latest', getLatestPosts);

module.exports = router;