const express = require('express');
const router = express.Router();
const university = require('../services/university');
const schedules = require('../services/schedules');
const schedule = require('../services/schedule');
const user = require('../services/user');


router.get('/university/faculty', async function (req, res, next) {
    try {
        res.json(await university.getFaculties());
    } catch (err) {
        console.error(`Error while getting faculties`, err.message);
        next(err);
    }
});

router.get('/university/speciality', async function (req, res, next) {
    try {
        res.json(await university.getSpeciality());
    } catch (err) {
        console.error(`Error while getting specialities`, err.message);
        next(err);
    }
});

router.get('/university/sub_faculty', async function (req, res, next) {
    try {
        res.json(await university.getSubFaculties());
    } catch (err) {
        console.error(`Error while getting sub-faculties`, err.message);
        next(err);
    }
});

router.get('/university/courses', async function (req, res, next) {
    try {

        if (req.query.speciality!==undefined)
            res.json(await university.getSpecialityCourses(req.query));
        else
            res.json(await university.getFacultyCourses(req.query));
    } catch (err) {
        console.error(`Error while getting courses`, err.message);
        next(err);
    }
});


router.get('/schedules/all', async function (req, res, next) {
    try {
        res.json(await schedules.getAllList(req.query));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/schedules/methodist', async function (req, res, next) {
    try {
        res.json(await schedules.getMethodistList(req.query));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/schedule/delete', async function (req, res, next) {
    try {
        res.json(await schedule.deleteSchedule(req.body.code));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/schedule/edit', async function (req, res, next) {
    try {
        res.json(await schedule.editSchedule(req.body));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/schedule/create', async function (req, res, next) {
    try {
        res.json(await schedule.createSchedule(req.body));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/schedule/new', async function (req, res, next) {
    try {
        res.json(await schedule.generateNewCode());
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/schedule/:code', async function (req, res, next) {
    try {
        res.json(await schedule.getSchedule(req.params.code));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/schedule/draft', async function (req, res, next) {
    try {
        res.json(await schedule.setDraftMode(req.body.id, req.body.draft));
    } catch (err) {
        console.error(err);
        next(err);
    }
});


router.post('/user/login', async function (req, res, next) {
    try {
        res.json(await user.getUser(req.body));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/user/courses', async function (req, res, next) {
    try {
        res.json(await user.getUserCourses(req.query.code));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/user/session', async function (req, res, next) {
    try {
        res.json(await user.getUserSession(req.query.code));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;