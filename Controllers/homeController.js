const Post = require('../Models/Post');


async function getLatestPosts(req, res) {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1) {
            return res.status(400).json({
                success: false,
                message: 'Page number must be at least 1'
            });
        }
        if (limit < 1) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be at least 1'
            });
        }


        const skip = (page - 1) * limit;


        const totalPosts = await Post.countDocuments();
   
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username profile.profilePhoto')
            .skip(skip)
            .limit(limit)
            .lean();

       
        const totalPages = Math.ceil(totalPosts / limit);

        
        res.json({
      
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                limit
            }
        });
    } catch (err) {
        console.error('Error fetching latest posts:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch latest posts'
        });
    }
}
module.exports = { getLatestPosts };