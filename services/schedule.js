const db = require('./db');


async function getSchedule(code) {
    const schedule = await db.query(`SELECT schedule.id,schedule.code,schedule.faculty_id, faculty.name as faculty, 
        schedule_type, academic_year, season, schedule.level, study_year, title, subfaculty.name as subfaculty, 
        speciality.name as speciality, schedule.speciality_id, schedule.subfaculty_id 
        FROM schedule 
        LEFT JOIN faculty ON schedule.faculty_id=faculty.id 
        LEFT JOIN subfaculty ON subfaculty.id=schedule.subfaculty_id 
        LEFT JOIN speciality ON speciality.id=schedule.speciality_id 
        WHERE code=? `, [code]);
    const courses = await db.query(`SELECT course_schedule.id, course_schedule.course_cdoc as course_code, 
        course_schedule.group, day_id, pair_id, weeks, classroom, 
        course.name as name, course_schedule.teacher as teacher, exam_type FROM course_schedule 
        LEFT JOIN course_season ON course_schedule.course_cdoc=course_season.course_cdoc 
        LEFT JOIN course ON course.sub_cdoc=course_schedule.course_cdoc 
        WHERE schedule_code=? ORDER BY day_id`, [code]);
    return {"schedule": schedule[0], "courses": courses}
}

async function deleteSchedule(code) {
    return await db.query(`DELETE FROM schedule WHERE code=?`, [code]);
}

async function editSchedule(req) {
    await deleteRows(req);
    const schedule = await db.query(`UPDATE schedule SET speciality_id=?, subfaculty_id=?, study_year=?, season=?, 
        academic_year=?, title=?, level=? 
        WHERE code=?`,
        [
            req.selected_speciality,
            req.selected_sub_faculty,
            req.selected_study_year,
            req.selected_season,
            req.selected_academic_year,
            req.selected_name,
            req.selected_level,
            req.schedule_code]);
    const rows = await insertRows(req.editTable, req.schedule_code);
    return {"schedule": schedule, "rows": rows};
}

async function deleteRows(req) {
    return await db.query(`DELETE FROM course_schedule WHERE schedule_code=?`, [req.schedule_code]);
}

async function createSchedule(req) {
    const schedule = await db.query(`INSERT INTO schedule (code, schedule_type, faculty_id,speciality_id, subfaculty_id, 
        study_year, season, academic_year, title, level, draft) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
            req.schedule_code,
            req.schedule_type,
            req.selected_faculty,
            req.selected_speciality,
            req.selected_sub_faculty,
            req.selected_study_year,
            req.selected_season,
            req.selected_academic_year,
            req.selected_name,
            req.selected_level]);
    const rows = await insertRows(req.editTable, req.schedule_code);
    return {"schedule": schedule, "rows": rows};
}

async function setDraftMode(id, draft) {
    return await db.query(`UPDATE schedule SET draft=? WHERE id=?`,
        [draft, id]);
}

async function generateNewCode() {
    const code=await db.query(`SELECT MAX(code) as code FROM schedule`);
    return code[0].code+1;
}

async function insertRows(table, code) {
    const res = [];
    for (let row of table)
        res.push(await db.query("INSERT INTO course_schedule (schedule_code, course_cdoc, course_schedule.group, day_id, " +
            "pair_id, weeks, classroom, exam_type, teacher) " +
            "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", [code, row.course_code, row.group, row.day_id, row.pair_id, row.weeks,
            row.classroom, row.exam_type, row.teacher]));
    return res;
}


module.exports = {
    createSchedule,
    deleteSchedule,
    editSchedule,
    getSchedule,
    setDraftMode,
    generateNewCode
};