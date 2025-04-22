const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
// const searchRoutes = require('./Routes/searchRoutes');
const homeRoutes = require('./Routes/homeRoutes');
const userRoutes = require('./Routes/userRoutes');
const blogRoutes = require('./Routes/blogRoutes');

const app = express();

app.use(express.json());
// Middleware
app.use(express.json());
app.use(cors());
// Database connection
mongoose.connect('mongodb://localhost:27017/GlobeBridge', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
app.get('/', (req, res) => {
    res.send('Travel Blog API is running');
});
// Routes
// app.use('/api/search', searchRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));