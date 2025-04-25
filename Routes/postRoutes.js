const express = require('express');
const router = express.Router();
const { auth} = require('../Middleware/auth');
const{
    searchPosts,
    createPost,
    updatePost,
    getPosts,
    deletePost
    } = require('../Controllers/postController')

router.get('/searchPosts',auth, searchPosts)
router.post('/post', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);  
router.get('/:id',getPosts);

module.exports = router;