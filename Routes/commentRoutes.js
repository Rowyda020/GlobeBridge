const express = require('express');
const router = express.Router();
const { auth } = require('../Middleware/auth')
const { createComment, deleteComment, getComments } = require('../Controllers/commentController');



router.post('/comments', auth, createComment);
router.delete('/comments/:commentId', auth, deleteComment);
router.get('/comments/:postId', getComments);



module.exports = router;