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
        "FROM speciality ORDER BY faculty_id")
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
                "course_schedule.group, day_id, pair_id, weeks, classroom, " +
                "course.name as name, course_schedule.teacher as teacher, exam_type FROM course_schedule " +
                "LEFT JOIN course_season ON course_schedule.course_cdoc=course_season.course_cdoc " +
                "LEFT JOIN course ON course.sub_cdoc=course_schedule.course_cdoc " +
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

server.get('/api/user/courses', (req, res) => {
    connection.query("SELECT course_cdoc as code, season, course.name, " +
        "academic_year, year, hours,credits, level, teacher, status_happened, reg_type " +
        "FROM kma_data.course_season " +
        "INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc " +
        "INNER JOIN course_register ON course_season.course_cdoc=course_register.sub_code " +
        "WHERE course_season.season='2' AND academic_year='2020' AND " +
        "course_register.user_code=? AND course_register.deleted='0';", [req.query.code])
        .then(([results, fields]) =>
            connection.query("SELECT course_schedule.id as id, course_cdoc, course_schedule.group, " +
                "pair_id, day_id, weeks, classroom as room, course.name as name, course_schedule.teacher as teacher, " +
                "course.chair_id as subfaculty " +
                "FROM course_schedule " +
                "LEFT JOIN course ON course.sub_cdoc=course_schedule.course_cdoc " +
                "WHERE course_schedule.exam_type IS NULL AND course_schedule.course_cdoc IN " +
                "(SELECT course_cdoc FROM course_season " +
                "INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc " +
                "WHERE course_season.season='2' AND academic_year='2020' " +
                "AND course_cdoc IN " +
                "(SELECT sub_code FROM kma_data.course_register WHERE user_code=? AND deleted='0'));", [req.query.code])
                .then(([results2, fields2]) => {
                    res.json({"course_data": results, "course_schedule": results2})
                })
                .catch(err =>
                    console.log(err)))
        .catch(err =>
            console.log(err));
});

server.get('/api/user/session', (req, res) => {
    connection.query("SELECT course_schedule.id as id, course_cdoc, course_schedule.group, " +
        "pair_id, day_id, weeks, classroom as room, course.name as name, course_schedule.teacher as teacher " +
        "FROM course_schedule " +
        "LEFT JOIN course ON course.sub_cdoc=course_schedule.course_cdoc " +
        "WHERE course_schedule.exam_type IS NOT NULL AND course_schedule.course_cdoc IN " +
        "(SELECT course_cdoc FROM course_season " +
        "INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc " +
        "WHERE course_season.season='2' AND academic_year='2020' " +
        "AND course_cdoc IN " +
        "(SELECT sub_code FROM kma_data.course_register WHERE user_code=? AND deleted='0'));", [req.query.code])
        .then(([results, fields]) => {
            res.json(results);
        })
        .catch(err =>
            console.log(err))
});

server.post('/api/schedule/draft', (req, res) => {
    connection.query("UPDATE schedule SET draft=? WHERE id=?", [req.body.draft, req.body.id])
        .then(([results, fields]) => {
            res.json({success: "yes"});
        })
        .catch(err =>
            console.log(err));
});

server.post('/api/schedule/delete', (req, res) => {
    connection.query("DELETE FROM schedule WHERE code=?", [req.body.code])
        .then(([results, fields]) => {
            res.json({success: "yes"});
        })
        .catch(err =>
            console.log(err));
});

server.post('/api/schedule/edit', (req, res) => {
    const code=req.body.schedule_code;
    console.log("Trying to edit schedule "+code);
    connection.query("UPDATE schedule SET speciality_id=?, subfaculty_id=?, study_year=?, season=?, " +
        "academic_year=?, title=?, level=? " +
        "WHERE code=?", [
        req.body.selected_speciality,
        req.body.selected_sub_faculty,
        req.body.selected_study_year,
        req.body.selected_season,
        req.body.selected_academic_year,
        req.body.selected_name,
        req.body.selected_level,
        code])
        .then(([results, fields]) => {
            console.log("Trying to edit schedule courses");
            connection.query("DELETE FROM course_schedule WHERE schedule_code=?", [code])
                .then(([results2, fields2]) => {
                    console.log(req.body.editTable);
                    insertRows(req.body.editTable, code);
                    res.json(results);
                });
        })
        .catch(err =>
            console.log(err))
        .finally();
});

function insertRows(table, code) {
    for (let row of table) {
        connection.query("INSERT INTO course_schedule (schedule_code, course_cdoc, course_schedule.group, day_id, " +
            "pair_id, weeks, classroom, exam_type, teacher) " +
            "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", [code, row.course_code, row.group, row.day_id, row.pair_id, row.weeks,
            row.classroom, row.exam_type, row.teacher]);
    }
}

server.post('/api/schedule/create', (req, res) => {
    console.log(req);
    connection.query("INSERT INTO schedule (code, schedule_type, faculty_id,speciality_id, subfaculty_id, " +
        "study_year, season, academic_year, title, level, draft) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)", [
        req.body.schedule_code,
        req.body.schedule_type,
        req.body.selected_faculty,
        req.body.selected_speciality,
        req.body.selected_sub_faculty,
        req.body.selected_study_year,
        req.body.selected_season,
        req.body.selected_academic_year,
        req.body.selected_name,
        req.body.selected_level])
        .then(([results, fields]) => {
            insertRows(req.body.editTable, req.body.schedule_code);
            res.json(results);
        })
        .catch(err =>
            console.log(err));
});