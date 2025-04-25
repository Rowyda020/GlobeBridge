const User = require('../Models/User');
const Post = require('../Models/Post');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');


async function register(req, res) {
    try {
        const { username, email, password, profile } = req.body;

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            profile
        });

        await user.save();
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            user: userResponse,
            token
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(400).json({ 
            message: err.message === 'JWT_SECRET is not configured' 
                ? 'Server configuration error' 
                : 'Registration failed'
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email });

  
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

       
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

    
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ message: 'Logged-in successfully' , token});


    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
}


async function getUserProfile(req, res) {
    try {
      
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required to view user profiles' });
        }

        const user = await User.findOne({ username: req.params.username })
            .select('-password -followers -following -email')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Get user profile error:', err);
        res.status(400).json({ message: err.message || 'Failed to retrieve user profile' });
    }
}

async function follow(req, res) {
    try {
        const targetUser = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user._id);
        
        if (!targetUser) return res.status(404).json({ message: 'User not found' });
        if (currentUser._id.equals(targetUser._id)) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        if (currentUser.following.includes(targetUser._id)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);
        
        await currentUser.save();
        await targetUser.save();
        
        res.json({ message: 'Successfully followed user' });

    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}



async function unFollow(req, res) {
    try {
        const targetUser = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user._id);
       
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.following.includes(targetUser._id)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        currentUser.following = currentUser.following.filter(
            id => !id.equals(targetUser._id)
        );
        targetUser.followers = targetUser.followers.filter(
            id => !id.equals(currentUser._id)
        );

        await currentUser.save();
        await targetUser.save();
        
        res.json({ message: 'Successfully unfollowed user' });

    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}
async function getFollowedAuthorsPosts(req, res){
    try {
      const user = await User.findById(req.user._id);
      const posts = await Post.find({ author: { $in: user.following } })
        .sort({ createdAt: -1 })
        .populate('author', 'username profile.profilePhoto');
      
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };



  module.exports = { register, login, getUserProfile, follow,  getFollowedAuthorsPosts,unFollow};