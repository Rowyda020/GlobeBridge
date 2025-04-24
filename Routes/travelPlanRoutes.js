const express = require('express');
const router = express.Router();
const { auth } = require('../Middleware/auth')

const { createTravelPlan, joinTravelPlan, leaveTravelPlan, getTravelPlans } = require('../Controllers/travelPlanController');


router.post('/travel-plans', auth, createTravelPlan);
router.post('/travel-plans/:travelPlanId/join', auth, joinTravelPlan);
router.post('/travel-plans/:travelPlanId/leave', auth, leaveTravelPlan);
router.get('/travel-plans', getTravelPlans);

module.exports = router;