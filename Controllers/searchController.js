const Blog = require('../Models/Blog');
const User = require('../Models/User');

exports.searchBlogs = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        
        if (!searchQuery) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const titleResults = await Blog.find({ 
            title: { $regex: query, $options: 'i' } 
        }).populate('author', 'username');
        const tagResults = await Blog.find({ 
            tags: { $regex: query, $options: 'i' } 
        }).populate('author', 'username');
        const authorResults = await Blog.find()
            .populate({
                path: 'author',
                match: { username: { $regex: query, $options: 'i' } },
                select: 'username'
            })
            .then(blogs => blogs.filter(blog => blog.author !== null));
        const allResults = [...titleResults, ...tagResults, ...authorResults];
        const uniqueResults = allResults.filter((blog, index, self) =>
            index === self.findIndex(b => b._id.toString() === blog._id.toString())
        );

        res.json(uniqueResults);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
};