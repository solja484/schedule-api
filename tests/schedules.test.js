const app = require("../setup");
const supertest = require("supertest");

test("GET /api/schedules/all", async () => {
    await supertest(app).get("/api/schedules/all").query({
        season: 1,
        year: 2020,
    }).expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBeTruthy();
        });
});
test("GET /api/schedules/methodist", async () => {
    await supertest(app).get("/api/schedules/methodist").query({
        season: 1,
        year: 2020,
        faculty_id: 123,
    }).expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBeTruthy();
        });
});
