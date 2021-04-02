const db = require('./db');

async function getMethodistList(req) {
    return await db.query(
        `SELECT * FROM schedule WHERE faculty_id=? AND academic_year=? AND season=?`,
        [req.faculty_id, req.year, req.season]);
}

async function getAllList(req) {
    return await db.query(
        `SELECT * FROM schedule WHERE draft=? AND academic_year=? AND season=?`,
        [0, req.year, req.season]);
}

module.exports = {
    getAllList,
    getMethodistList
};