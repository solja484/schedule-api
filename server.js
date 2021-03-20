const express = require('express');
const server = express();
const path = require('path');
const config = require('./config.json');
const bodyParser = require('body-parser');
const mysql = require("mysql2");

server.use(express.static(path.join(__dirname, '../schedule-vue/build')));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.listen(3080, () => {
    console.log('listening on 3080')
});

const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    database: config.database,
    password: config.password
}).promise();


server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build/index.html'));
});

server.get('/api/faculty', (req, res) => {
    connection.query("SELECT * FROM faculty")
        .then(([results, fields]) =>
            res.json(results))
        .catch(err =>
            console.log(err));
});
server.get('/api/sub_faculty', (req, res) => {
    connection.query("SELECT * FROM subfaculty ORDER BY faculty_id")
        .then(([results, fields]) =>
            res.json(results))
        .catch(err =>
            console.log(err));
});
server.get('/api/speciality', (req, res) => {
    connection.query("SELECT DISTINCT name, id, faculty_id, level " +
        "FROM speciality ORDER BY speciality.level")
        .then(([results, fields]) =>
            res.json(results))
        .catch(err =>
            console.log(err));
});

server.get('/api/methodist/schedules', (req, res) => {
    connection.query("SELECT * FROM schedule WHERE faculty_id=? AND academic_year=? AND season=?",
        [req.query.faculty_id, req.query.year, req.query.season])
        .then(([results, fields]) =>
            res.json(results))
        .catch(err =>
            console.log(err));
});

server.get('/api/schedules', (req, res) => {
    connection.query("SELECT * FROM schedule " +
        "WHERE draft=? AND academic_year=? AND season=?", [0, req.query.year, req.query.season])
        .then(([results, fields]) =>
            res.json(results))
        .catch(err =>
            console.log(err));
});

server.get('/api/schedule/:code', (req, res) => {
    connection.query("SELECT schedule.id,schedule.code,schedule.faculty_id, faculty.name as faculty, schedule_type, " +
        "academic_year, season, schedule.level, study_year, title, subfaculty.name as subfaculty, " +
        "speciality.name as speciality, schedule.speciality_id, schedule.subfaculty_id FROM schedule " +
        "LEFT JOIN faculty ON schedule.faculty_id=faculty.id " +
        "LEFT JOIN subfaculty ON subfaculty.id=schedule.subfaculty_id " +
        "LEFT JOIN speciality ON speciality.id=schedule.speciality_id " +
        "WHERE code=? ", [req.params.code])
        .then(([results, fields]) =>
            connection.query("SELECT course_schedule.id, course_schedule.course_cdoc as course_code, " +
                "course_schedule.group, day_id, pair_id, weeks, classroom.number as classroom, " +
                "course.name as name, course.teacher as teacher, exam_type FROM course_schedule " +
                "LEFT JOIN course_season ON course_schedule.course_cdoc=course_season.course_cdoc " +
                "LEFT JOIN course ON course.sub_cdoc=course_schedule.course_cdoc " +
                "LEFT JOIN classroom ON course_schedule.classroom=classroom.id " +
                "WHERE schedule_code=? ORDER BY day_id", [req.params.code]).then(([results2, fields2]) =>
                res.json({"schedule": results[0], "courses": results2}))
                .catch(err =>
                    console.log(err)))
        .catch(err =>
            console.log(err));
});
server.get('/api/courses', (req, res) => {
    if (req.query.speciality)
        connection.query("SELECT course.id as id, sub_cdoc as course_code, course.name as name, actual_group, " +
            "season, exam_form FROM course_speciality " +
            "LEFT JOIN course ON course.sub_cdoc=course_speciality.course_cdoc " +
            "LEFT JOIN course_season ON course.sub_cdoc=course_season.course_cdoc " +
            "WHERE course_speciality.speciality_id=? " +
            "AND course.level=? AND course.status_happened='happened' " +
            "AND course_season.season=? AND course.academic_year=?",
            [req.query.speciality, req.query.level, req.query.season, req.query.academic_year])
            .then(([results, fields]) => {
                console.log(results);
                res.json(results);
            }).catch(err =>
            console.log(err));
    else
        connection.query("SELECT course.id as id, sub_cdoc as course_code, course.name as name, actual_group, " +
            "season, exam_form FROM course_speciality " +
            "LEFT JOIN course ON course.sub_cdoc=course_speciality.course_cdoc " +
            "LEFT JOIN course_season ON course.sub_cdoc=course_season.course_cdoc " +
            "WHERE course.level=? AND course.status_happened='happened' " +
            "AND course_season.season=? AND course.academic_year=? " +
            "AND course_speciality.speciality_id IN " +
            "(SELECT id FROM speciality WHERE faculty_id=?)",
            [req.query.level, req.query.season, req.query.academic_year, req.query.faculty])
            .then(([results, fields]) => {
                console.log(results);
                res.json(results);
            }).catch(err =>
            console.log(err));
});

server.get('/api/schedule_new_code', (req, res) => {
    console.log("generated schedule code");
    connection.query("SELECT MAX(code) as code FROM schedule ")
        .then(([results, fields]) => {
            console.log("generated schedule code");
            const new_code = results[0].code + 1;
            res.json(new_code)
        })
        .catch(err =>
            console.log(err));
});

server.post('/api/login', (req, res) => {
    connection.query("SELECT id, link, role, code, name " +
        "FROM _user WHERE login=? AND password=?", [req.body.login, req.body.password])
        .then(([results, fields]) => {
            if (results[0].role == 'metodist_dec')
                connection.query("SELECT faculty_id, faculty_name " +
                    "FROM _metodist WHERE id=?", [results[0].link])
                    .then(([results2, fields2]) => {
                        results[0].methodist = results2[0];
                        console.log(results[0]);
                        res.json(results[0]);
                    }).catch(err =>
                    console.log(err));
            else if (results[0].role == 'student')
                connection.query("SELECT spec_id, speciality.name as speciality, " +
                    "faculty_id, faculty.name as faculty_name FROM student " +
                    "INNER JOIN speciality ON student.spec_id=speciality.id " +
                    "INNER JOIN faculty ON speciality.faculty_id=faculty.id " +
                    "WHERE student.id=?", [results[0].link])
                    .then(([results2, fields2]) => {
                        results[0].student = results2[0];
                        console.log(results[0]);
                        res.json(results);
                    }).catch(err =>
                    console.log(err));
        }).catch(err =>
        console.log(err));
});

server.get('/api/days', (req, res) => {
    connection.query("SELECT * FROM working_days ORDER BY number")
        .then(([results, _]) =>
            res.json(results))
        .catch(err =>
            console.log(err));
});

server.get('/api/pairs', (req, res) => {
    connection.query("SELECT * FROM pairs ORDER BY number")
        .then(([results, _]) =>
            res.json(results)).catch(err =>
        console.log(err));
});

server.get('/api/user/:usercode/courses', (req, res) => {
    connection.query("SELECT course_cdoc as code, season, course.name, " +
        "academic_year, year, hours,credits, level,teacher, status_happened, reg_type " +
        "FROM kma_data.course_season " +
        "INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc " +
        "INNER JOIN course_register ON course_season.course_cdoc=course_register.sub_code " +
        "WHERE course_season.season='2' AND academic_year='2020' AND " +
        "course_register.user_code='204186'AND course_register.deleted='0';")
        .then(([results, fields]) =>
            connection.query("SELECT course_schedule.id as id, course_cdoc, course_schedule.group, " +
                "pair_id, day_id, weeks, classroom.number FROM course_schedule " +
                "LEFT JOIN classroom ON course_schedule.classroom = classroom.id " +
                "WHERE course_cdoc IN " +
                "(SELECT course_cdoc FROM course_season " +
                "INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc " +
                "WHERE course_season.season='2' AND academic_year='2020' AND status_happened='happened' " +
                "AND course_cdoc IN " +
                "(SELECT sub_code FROM kma_data.course_register WHERE user_code='204186'AND deleted='0'));")
                .then(([results2, fields2]) =>
                    res.json({"course_data": results, "course_schedule": results2}))
                .catch(err =>
                    console.log(err)))
        .catch(err =>
            console.log(err));
});


server.post('/api/schedule_draft', (req, res) => {
    console.log(req);
    connection.query("UPDATE schedule SET draft=? WHERE id=?", [req.body.draft, req.body.id])
        .then(([results, fields]) => {
            console.log(results);
            res.json({success:"yes"});
        })
        .catch(err =>
            console.log(err));
});