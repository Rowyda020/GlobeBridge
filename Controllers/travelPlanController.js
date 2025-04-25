const TravelPlan = require('../Models/TravelPlan');
const User = require('../Models/User');


async function createTravelPlan(req, res) {
    try {
        const { destination, startDate, endDate, description } = req.body;
        const userId = req.user._id;

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: 'Start date must be before end date' });
        }

        const travelPlan = new TravelPlan({
            userId,
            destination,
            startDate,
            endDate,
            description,
            participants: [userId]
        });

        await travelPlan.save();
        const populatedPlan = await TravelPlan.findById(travelPlan._id)
            .populate('userId', 'username profile.profilePhoto')
            .populate('participants', 'username profile.profilePhoto');

        res.status(201).json(populatedPlan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function joinTravelPlan(req, res) {
    try {
        const travelPlanId = req.params.travelPlanId;
        const userId = req.user._id;

        const travelPlan = await TravelPlan.findById(travelPlanId);
        if (!travelPlan) {
            return res.status(404).json({ message: 'Travel plan not found' });
        }

        if (travelPlan.participants.includes(userId)) {
            return res.status(400).json({ message: 'Already a participant' });
        }

        travelPlan.participants.push(userId);
        await travelPlan.save();

        const populatedPlan = await TravelPlan.findById(travelPlanId)
            .populate('userId', 'username profile.profilePhoto')
            .populate('participants', 'username profile.profilePhoto');

        res.json(populatedPlan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function leaveTravelPlan(req, res) {
    try {
        const travelPlanId = req.params.travelPlanId;
        const userId = req.user._id;

        const travelPlan = await TravelPlan.findById(travelPlanId);
        if (!travelPlan) {
            return res.status(404).json({ message: 'Travel plan not found' });
        }

        if (!travelPlan.participants.includes(userId)) {
            return res.status(400).json({ message: 'Not a participant' });
        }

        if (travelPlan.userId.toString() === userId.toString()) {
            return res.status(400).json({ message: 'Creator cannot leave the plan' });
        }

        travelPlan.participants = travelPlan.participants.filter(
            id => id.toString() !== userId.toString()
        );
        await travelPlan.save();

        const populatedPlan = await TravelPlan.findById(travelPlanId)
            .populate('userId', 'username profile.profilePhoto')
            .populate('participants', 'username profile.profilePhoto');

        res.json(populatedPlan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getTravelPlans(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1) {
            return res.status(400).json({ message: 'Page number must be at least 1' });
        }
        if (limit < 1) {
            return res.status(400).json({ message: 'Limit must be at least 1' });
        }

        const skip = (page - 1) * limit;
        const totalPlans = await TravelPlan.countDocuments();

        const travelPlans = await TravelPlan.find()
            .populate('userId', 'username profile.profilePhoto')
            .populate('participants', 'username profile.profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPages = Math.ceil(totalPlans / limit);

        res.json({
            travelPlans,
            pagination: {
                currentPage: page,
                totalPages,
                totalPlans,
                limit
            }
        });
    } catch (err) {
        console.error('Get travel plans error:', err);
        res.status(400).json({ message: err.message || 'Failed to retrieve travel plans' });
    }
}

module.exports = { createTravelPlan, joinTravelPlan, leaveTravelPlan, getTravelPlans };