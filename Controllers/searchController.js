const Blog = require('../Models/Blog');
const User = require('../Models/User');

exports.searchBlogs = async (req, res) => {
    try {
        const { searchQuery } = req.query;
        
        if (!searchQuery) {
            return res.status(400).json({ message: 'Search query is required' });
        }
       const blogResults = await Blog.find({
        $or:[
            {title: {$regex: searchQuery, $options:'i'}},
            {tags:{$regex: searchQuery, $options:'i'}},
            {'location.country':{$regex: searchQuery, $options:'i'}},
            { 'location.city': { $regex: searchQuery, $options: 'i' } },
        ]
       }).populate('autoher','username profile');

       const userResults = await User.find({
        $or:[
            { username: { $regex: query, $options: 'i' } },
            { 'profile.interests': { $regex: query, $options: 'i' } },
            { 'profile.homeCountry': { $regex: query, $options: 'i' } },
            { 'profile.languages': { $regex: query, $options: 'i' } }
        ]
       }).select('-password');
       res.json({
        blogs: blogResults,
        users: userResults
    });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
};