const Comment = require('../Models/Comment');
const Post = require('../Models/Post');

console.log('Comment in controller:', Comment);

async function createComment(req, res) {
    try {
        const { blogId, content, parentCommentId } = req.body;
        const userId = req.user._id;

        const blog = await Post.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = new Comment({
            blogId,
            userId,
            content,
            parentCommentId: parentCommentId || null
        });

        await comment.save();
        const populatedComment = await Comment.findById(comment._id)
            .populate('userId', 'username profile.profilePhoto');

        res.status(201).json(populatedComment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function deleteComment(req, res) {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await Comment.deleteOne({ _id: commentId });
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getComments(req, res) {
    try {
        const blogId = req.params.blogId;
        const comments = await Comment.find({ blogId })
            .populate('userId', 'username profile.profilePhoto')
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = { createComment, deleteComment, getComments };