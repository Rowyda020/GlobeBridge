const express = require('express');
const router = express.Router();
const { auth } = require('../Middleware/auth')
const{
    register,
    login,
    getUserProfile,
    follow,
    getFollowedAuthorsPosts,
    unFollow
} = require('../Controllers/userController');




router.post('/register', register);
router.post('/login', login);
router.get('/profile/:username',auth, getUserProfile);
router.get('/follow/:userId', auth, follow);
router.get('/unfollow/:userId', auth, unFollow);
router.get('/feed', auth, getFollowedAuthorsPosts);

module.exports = router;