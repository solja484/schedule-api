const db = require('./db');

async function getUser(req) {
    let user = await db.query(
        `SELECT id, link, role, code, name FROM _user WHERE login=? AND password=?`,
        [req.login, req.password]);
    if (user[0].role == 'metodist_dec')
        user[0].methodist = await getMethodistDetails(user[0]);
    else if (user[0].role == 'student')
        user[0].student = await getStudentDetails(user[0]);
    return user;
}

async function getStudentDetails(student) {
    return await db.query(
        `SELECT spec_id, speciality.name as speciality, 
        faculty_id, faculty.name as faculty_name FROM student 
        INNER JOIN speciality ON student.spec_id=speciality.id 
        INNER JOIN faculty ON speciality.faculty_id=faculty.id 
        WHERE student.id=?`,
        [student.link])[0];
}

async function getMethodistDetails(methodist) {
    return await db.query(`SELECT faculty_id, faculty_name FROM _metodist WHERE id=?`, [methodist.link])[0];
}

async function getUserCourses(req) {
    const data = await db.query(
        `SELECT course_cdoc as code, season, course.name, 
            academic_year, year, hours,credits, level, teacher, status_happened, reg_type 
            FROM kma_data.course_season 
            INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc 
            INNER JOIN course_register ON course_season.course_cdoc=course_register.sub_code 
            WHERE course_season.season='2' AND academic_year='2020' AND 
            course_register.user_code=? AND course_register.deleted='0'`,
        [req.code]);
    const schedule = await db.query(
        `SELECT course_schedule.id as id, course_cdoc, course_schedule.group, 
                pair_id, day_id, weeks, classroom as room, course.name as name, course_schedule.teacher as teacher, 
                course.chair_id as subfaculty 
                FROM course_schedule 
                LEFT JOIN course ON course.sub_cdoc=course_schedule.course_cdoc 
                WHERE course_schedule.exam_type IS NULL AND course_schedule.course_cdoc IN 
                (SELECT course_cdoc FROM course_season 
                INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc 
                WHERE course_season.season='2' AND academic_year='2020' 
                AND course_cdoc IN 
                (SELECT sub_code FROM kma_data.course_register WHERE user_code=? AND deleted='0'));`,
        [req.code]);
    return {"course_data": data, "course_schedule": schedule}
}

async function getUserSession(req) {
    const res = await db.query(
        `SELECT course_schedule.id as id, course_cdoc, course_schedule.group, 
            pair_id, day_id, weeks, classroom as room, course.name as name, course_schedule.teacher as teacher 
            FROM course_schedule 
            LEFT JOIN course ON course.sub_cdoc=course_schedule.course_cdoc 
            WHERE course_schedule.exam_type IS NOT NULL AND course_schedule.course_cdoc IN 
            (SELECT course_cdoc FROM course_season 
            INNER JOIN course ON course_season.course_cdoc=course.sub_cdoc 
            WHERE course_season.season='2' AND academic_year='2020' 
            AND course_cdoc IN 
            (SELECT sub_code FROM kma_data.course_register WHERE user_code=? AND deleted='0'))`,
        [req.code]);
    return res;
}

module.exports = {
    getUser,
    getUserCourses,
    getUserSession
};