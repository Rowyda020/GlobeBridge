const User = require('../Models/User');
const Blog = require('../Models/Blog');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');





async function register(req, res) {
    try {
        const { username, email, password, profile } = req.body;

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        // 1. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Create new user with hashed password
        const user = new User({
            username,
            email,
            password: hashedPassword,
            profile
        });

        // 3. Save user
        await user.save();

        // 4. Generate token
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Remove password from response
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


async function getUserProfile(req,res){
    try{

        const user = await User.findOne({username:req.params.username})
        .select('-password -followers -following')
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!req.user) {
            return res.json({
              username: user.username,
              profile: { profilePhoto: user.profile.profilePhoto }
            });
          }
    } catch(err){
        res.status(400).json({ message: err.message });
    }
}

async function follow(req,res) {
    try{
        const targerUser = await User.findById(req.params.userId)
        const currentUser = await User.findById(req.user._id);
        if (!targerUser) return res.status(404).json({ message: 'User not found' });
        if (currentUser.following.includes(targerUser._id)) {
            return res.status(400).json({ message: 'Already following this user' });
          }
          currentUser.following.push(targerUser._id);
          targerUser.followers.push(currentUser._id);
    await currentUser.save();
    await targerUser.save();
    res.json({ message: 'Successfully followed user' });


    }catch(err){
        res.status(400).json({ message: err.message });
    }
    
}



async function unFollow(req,res) {
    try{
        const targetUser = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user._id);
       
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.following.includes(targetUser._id)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        currentUser.following = currentUser.following.filter(
            id => id.toString() !== targetUser._id.toString()
        );
        targetUser.followers = targetUser.followers.filter(
            id => id.toString() !== currentUser._id.toString()
        );

        await currentUser.save();
        await targetUser.save();
        
        res.json({ message: 'Successfully unfollowed user' });


    }catch(err){
        res.status(400).json({ message: err.message });
    }
    
}

async function getFollowedAuthorsPosts(req, res){
    try {
      const user = await User.findById(req.user._id);
      const posts = await Blog.find({ author: { $in: user.following } })
        .sort({ createdAt: -1 })
        .populate('author', 'username profile.profilePhoto');
      
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };



  module.exports = { register, login, getUserProfile, follow,  getFollowedAuthorsPosts,unFollow};