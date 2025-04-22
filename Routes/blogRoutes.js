const express = require('express');
const router = express.Router();
const { auth} = require('../Middleware/auth');
const{
    searchBlogs,
    createPost,
    updatePost,
    getPosts,
    deletePost
    } = require('../Controllers/blogController')

router.get('/searchBlogs', searchBlogs)
router.post('/post', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);  
router.get('/:id',getPosts);

module.exports = router;