const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3080;
const router = require('./routes/router');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));
app.use(express.static(path.join(__dirname, '../schedule-vue/build')));
app.get('/', (req, res) => {
    res.json({'message': 'ok'});
});

app.use('/api', router);

// Error handler middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({'message': err.message});
    return;
});

app.listen(port, () => {
    console.log('listening to ' +port)
});


//

/*


server.post('/user/login', (req, res) => {
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

server.get('/user/courses', (req, res) => {
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

server.get('/user/session', (req, res) => {
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


server.post('/schedule/edit', (req, res) => {
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


server.post('/schedule/create', (req, res) => {
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
});*/
