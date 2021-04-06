const app = require("../setup");
const supertest = require("supertest");

test("GET /api/university/faculty", async () => {
    await supertest(app).get("/api/university/faculty").expect(200)
        .then((response) => {
            // Check type and length
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toEqual(6);

            // Check data
            expect(response.body[0].id).toBe(121);
        });
});

test("GET /api/university/speciality", async () => {
    await supertest(app).get("/api/university/speciality").expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBeTruthy();
        });
});

test("GET /api/university/sub_faculty", async () => {
    await supertest(app).get("/api/university/sub_faculty").expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBeTruthy();
        });
});

test("GET /api/university/courses", async () => {
    await supertest(app).get("/api/university/courses").query({
        level: 1,
        season: 1,
        academic_year: 2020,
        faculty: 123

    }).expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBeTruthy();
        });
});

test("GET /api/university/specialitycourses", async () => {
    await supertest(app).get("/api/university/courses").query({
        level: 1,
        season: 1,
        academic_year: 2020,
        faculty: 123,
        speciality: 1477
    }).expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBeTruthy();
        });
});