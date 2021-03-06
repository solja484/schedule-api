const db = require('./db');


async function getFaculties() {
    return await db.query("SELECT * FROM faculty");
}

async function getSubFaculties() {
    return await db.query(`SELECT * FROM subfaculty ORDER BY faculty_id`);
}

async function getSpeciality() {
    return await db.query(`SELECT DISTINCT name, id, faculty_id, level FROM speciality ORDER BY faculty_id`);
}

async function getSpecialityCourses(req) {
    console.log("SPECIALITY COURSES");
    console.log(req);
    return await db.query(
        `SELECT DISTINCT course.id as id, sub_cdoc as course_code, course.name as name, actual_group, 
            season, exam_form FROM course_speciality 
            LEFT JOIN course ON course.sub_cdoc=course_speciality.course_cdoc 
            LEFT JOIN course_season ON course.sub_cdoc=course_season.course_cdoc 
            WHERE course_speciality.speciality_id=? 
            AND course.level=? AND course.status_happened=? 
            AND course_season.season=? AND course.academic_year=?`,
        [req.speciality, req.level, 'happened', req.season, req.academic_year]
    );
}

async function getFacultyCourses(req) {
    console.log("FACULTY COURSES");
    console.log(req);
    return await db.query(
        `SELECT DISTINCT course.id as id, sub_cdoc as course_code, course.name as name, actual_group, 
            season, exam_form FROM course_speciality 
            LEFT JOIN course ON course.sub_cdoc=course_speciality.course_cdoc 
            LEFT JOIN course_season ON course.sub_cdoc=course_season.course_cdoc 
            WHERE course.level=? AND course.status_happened=? 
            AND course_season.season=? AND course.academic_year=? 
            AND course.chair_id IN 
            (SELECT id FROM subfaculty WHERE faculty_id=?)`,
        [req.level, 'happened', req.season, req.academic_year, req.faculty]);
}

module.exports = {
    getFaculties,
    getSubFaculties,
    getSpeciality,
    getSpecialityCourses,
    getFacultyCourses
};