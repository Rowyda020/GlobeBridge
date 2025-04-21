const mongoose = require('mongoose');
const blogSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    photo:{
        type:String
    },
    author:{
        type:String,
        required:true
    },
    tags:{
        type:[String],
        required:true
    },
    location: {
        country: String,
        city: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    budget: {
        amount: Number,
        currency: String
    },
},
{ timestamps: true });
const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;