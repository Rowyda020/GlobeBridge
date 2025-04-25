const Post = require('../Models/Post');
const User = require('../Models/User');

async function createPost(req, res) {
  try {
    const author = await User.findById(req.user._id).select('username profile');

    const post = new Post({
        ...req.body,
        author: req.user._id,
        authorName: author.username 
    });
    
    

      await post.save();
      await post.populate({
          path: 'author',
          select: 'username profile'
      });

      const response = {
          ...post.toObject(),
          author: {
              _id: post.author._id,
              username: post.author.username,
              profile: {
                  homeCountry: post.author.profile?.homeCountry,
                  languages: post.author.profile?.languages || [],
                  profilePhoto: post.author.profile?.profilePhoto,
                  interests: post.author.profile?.interests || []
              }
          }
      };

      res.status(201).json(response);
  } catch (err) {
      res.status(400).json({
          message: err.message,
          error: "Failed to create post"
      });
  }
}




async function updatePost(req,res){
    try{
        const post = await Post.findOneAndUpdate({
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
        const post = await Post.findOneAndDelete({
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


async function getPosts(req, res) {
  try {
      const post = await Post.findById(req.params.id)
          .populate({
              path: 'author',
              select: 'username profile',
              populate: {
                  path: 'profile.profilePhoto' 
              }
          });

      if (!post) {
          return res.status(404).json({ message: 'Post not found' });
      }

      const authorData = {
          username: post.author?.username || 'Unknown',
          profile: {
              profilePhoto: post.author?.profile?.profilePhoto || null
          }
      };

      if (!req.user) {
          const basicPostInfo = {
              _id: post._id,
              title: post.title,
              body: post.body,
              photos: post.photos || [],
              location: post.location || {},
              author: authorData,
              createdAt: post.createdAt
          };
          return res.json(basicPostInfo);
      }

      res.json(post);
  } catch (err) {
      res.status(400).json({ 
          message: err.message,
          error: "Error retrieving post"
      });
  }
}

async function searchPosts(req, res) {
  try {
    const query = req.query.q || '';
    const basicSearch = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { authorName: { $regex: query, $options: 'i' } },
        { 'location.country': { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } }
      ]
    };

    const posts = await Post.find(basicSearch)
      .populate('author', 'username profile.profilePhoto')
     

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


module.exports = { searchPosts ,createPost,updatePost,getPosts,deletePost};