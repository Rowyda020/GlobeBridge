const Blog = require('../Models/Blog');
const User = require('../Models/User');


async function createPost(req,res){
    try{
        const post = new Blog({
            ...req.body,
            author: req.user._id
        })
        await post.save();
        res.status(201).json(post)
    } catch (err) {
        res.status(400).json({ message: err.message });
      }
}

async function updatePost(req,res){
    try{
        const post = await Blog.findOneAndUpdate({
            _id:req.params.id, author:req.user._id
        },
        req.body,
        {new: true}
    );
    if(!post) return res.status(404).json({ message: 'Post not found or unauthorized user' })
        res.json(post);
       
    } catch (err) {
        res.status(400).json({ message: err.message });
      }
}
async function deletePost(req, res) {
    try {
        const post = await Blog.findOneAndDelete({
            _id: req.params.id,
            author: req.user._id
        });

        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found or unauthorized user' 
            });
        }

        res.json({ 
            message: 'Post deleted successfully',
            deletedPost: {
                id: post._id,
                title: post.title
            }
        });

    } catch (err) {
        res.status(400).json({ 
            message: err.message 
        });
    }
}
async function getPosts(req,res){
    try{
     const post = await Blog.findById(req.params.id)
     .populate('author','username profile.profilePhoto');
     if (!post) return res.status(404).json({ message: 'Post not found' });

     if(!req.user){
        const basicPostInfo = {
            _id: post._id,
            title: post.title,
            body: post.body,
            photos: post.photos,
            location: post.location,
            author: {
              username: post.author.username,
              profile: { profilePhoto: post.author.profile.profilePhoto }
            },
            createdAt: post.createdAt
          };
          return res.json(basicPostInfo);
     }
     res.json(post)
       
    } catch (err) {
        res.status(400).json({ message: err.message });
      }
}


async function searchBlogs(req, res) {
    try {
        const query = req.query.q || '';
        const basicSearch = {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { 'location.country': { $regex: query, $options: 'i' } }
          ]
        };
        
        const enhancedSearch = req.user ? {
          $or: [
            ...basicSearch.$or,
            { tags: { $regex: query, $options: 'i' } },
            { 'location.city': { $regex: query, $options: 'i' } }
          ]
        } : basicSearch;
        
        const blogs = await Blog.find(enhancedSearch)
          .populate('author', 'username profile.profilePhoto')
          .limit(req.user ? 50 : 20); 
        
        res.json(blogs);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

module.exports = { searchBlogs ,createPost,updatePost,getPosts,deletePost};