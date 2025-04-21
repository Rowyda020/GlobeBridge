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
},
{ timestamps: true });
const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;