const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
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
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      authorName: {
        type: String,
        required: true
      }
,      
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
const Post = mongoose.model('Blog', postSchema);
module.exports = Post;