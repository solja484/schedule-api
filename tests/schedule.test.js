const app = require("../setup");
const supertest = require("supertest");


test("GET /api/schedule/412345", async () => {
    await supertest(app).get("/api/schedule/412345").expect(200)
        .then((response) => {
            expect(response.body.schedule.code + "").toBe('412345');
        });
});

test("GET /api/schedule/draft", async () => {
    await supertest(app).post("/api/schedule/draft").send({
        id: '412345', draft: 0
    }).expect(200)
        .then((response) => {
            expect(response.body.changedRows).toBeLessThan(2);
        });
});

test("GET /api/schedule/CRUD", async () => {
    await supertest(app).get('/api/schedule/new').expect(200).then(async (resp) => {
        expect(resp.text.length).toBe(6);
        await supertest(app).post("/api/schedule/create").send({
            schedule_code: resp.text,
            schedule_type: 'session',
            selected_faculty: '121',
            selected_speciality: '1477',
            selected_sub_faculty: null,
            selected_study_year: 2,
            selected_season: 2,
            selected_academic_year: 2020,
            selected_name: "Name",
            selected_level: 2,
            editTable: [{
                course_code: '242130',
                group: 1,
                day_id: 1,
                pair_id: 1,
                weeks: "",
                classroom: "",
                exam_type: 1,
                teacher: ""
            }]
        }).expect(200)
            .then(async (resp2) => {
                expect(Array.isArray(resp2.body.rows)).toBeTruthy();
            });
        await supertest(app).post("/api/schedule/edit")
            .send({
                schedule_code: resp.text,
                schedule_type: 'session',
                selected_faculty: '121',
                selected_speciality: '1477',
                selected_sub_faculty: null,
                selected_study_year: 1,
                selected_season: 1,
                selected_academic_year: 2020,
                selected_name: "New name",
                selected_level: 1,
                editTable: [{
                    course_code: '242130',
                    group: 2,
                    day_id: 2,
                    pair_id: 5,
                    weeks: "1-15",
                    classroom: "remote",
                    exam_type: 1,
                    teacher: "teacher"
                }]
            }).expect(200)
            .then(async (resp3) => {
                expect(Array.isArray(resp3.body.rows)).toBeTruthy();
                await supertest(app).post("/api/schedule/delete")
                    .send({code: resp.text}).expect(200).then((resp4)=>{
                        expect(resp4.body).toBeTruthy();
                    });
            });

    })
});

