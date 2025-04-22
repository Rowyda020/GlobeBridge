const Blog = require('../Models/Blog');


async function getLatestPosts(req,res){
    try{
        const posts = await Blog.find().sort({createdAt:-1})
        .populate('author','username profile.profilePhoto')
        .limit(50)
        .lean();


        res.json({
            success: true,
            posts: posts,
            totalPosts: posts.length
        });
    }catch (error) {
        console.error('Error fetching latest posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch latest posts'
        });
    }
}
module.exports = { getLatestPosts };