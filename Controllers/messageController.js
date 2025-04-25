const Message = require('../Models/Message');
const User = require('../Models/User');

console.log('Message in controller:', Message);

async function sendMessage(req, res) {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;


        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (receiverId === senderId.toString()) {
            return res.status(400).json({ message: 'Cannot send message to yourself' });
        }

    
        const message = new Message({
            senderId,
            receiverId,
            content
        });

        await message.save();
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'username profile.profilePhoto')
            .populate('receiverId', 'username profile.profilePhoto');

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


async function getMessages(req, res) {
    try {
        const userId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        })
            .populate('senderId', 'username profile.profilePhoto')
            .populate('receiverId', 'username profile.profilePhoto')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function markMessagesAsRead(req, res) {
    try {
        const userId = req.user._id;
        const senderId = req.params.senderId;

        await Message.updateMany(
            { senderId, receiverId: userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = { sendMessage, getMessages, markMessagesAsRead };