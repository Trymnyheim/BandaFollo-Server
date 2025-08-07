const express = require('express');
const holidayRouter = express.Router();
const HolidayManager = require('../db/HolidayManager');
const { UserManager } = require('../db/UserManager');
const logger = require('../db/Logger');

// Retrieves active holiday and hours:
// JSON-format: {holiday: active_holiday, hours: {active_holiday: [{day, time}, ...]}
holidayRouter.get('/get_holiday', async (req, res) => {
    try {
        const holiday = await HolidayManager.getHoliday();
        res.json(holiday);
        logger.log('holidayRouter', 'Retrieval of holiday-data.', true, null);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Something went wrong retrieving holiday data.'});
        logger.log('holidayRouter', err, false, null);
    }
})

// Retrieves all holiday data:
holidayRouter.get('/get_holidays', UserManager.authenticateToken, async (req, res) => {
    try {
        const holidays = await HolidayManager.getHolidays();
        res.json(holidays)
        logger.log('holidayRouter', 'Retrieval of all holiday-data.', true, req.user.username);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Something went wrong retrieving holiday data'});
        logger.log('holidayRouter', err, false, null);
    }
})

// Sets holiday hours:
// JSON-format: {activeHoliday: "", hours: {christmas: [ {day, hour}, ...], easter: [ {day, hour}, ...], summer: [ {day, hour}, ...] }}
holidayRouter.post('/set_holiday', UserManager.authenticateToken, async (req, res) => {
    const { activeHoliday, hours } = req.body;
    if (!hours) {
        return res.status(400).json({ error: 'Missing or invalid holiday data'});
    }
    try {
        if (!HolidayManager.isAllowed(activeHoliday))
            return res.status(400).json({ error: `Invalid holiday name: ${activeHoliday}` });
        await HolidayManager.setActiveHoliday(activeHoliday);
        await HolidayManager.setHours(hours);
        console.log(`HolidayManager set to: ${activeHoliday ? activeHoliday : 'none'}`)
        res.status(200).json({success: true, message: 'Hours has been successfully updated'});
        logger.log('holidayRouter', 'Update of holiday-data.', true, req.user.username);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong setting hours'});
        logger.log('holidayRouter', err, false, null);
    }
})

module.exports = holidayRouter;