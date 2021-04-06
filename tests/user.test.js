const app = require("../setup");
const supertest = require("supertest");

test("GET /api/user/courses", async () => {
    await supertest(app).get("/api/user/courses").query({
        code: '204186'
    }).expect(200)
        .then((response) => {
            expect(Array.isArray(response.body.course_data)).toBeTruthy();
            expect(Array.isArray(response.body.course_schedule)).toBeTruthy();
        });
});

test("GET /api/user/session", async () => {
    await supertest(app).get("/api/user/session").query({
        code: '204186'
    }).expect(200)
        .then((response) => {
            expect(Array.isArray(response.body)).toBeTruthy();
        });
});


test("GET /api/user/login {role:methodist}", async () => {
    await supertest(app).post("/api/user/login").send({
        login: "methodist",
        password: "methodist"
    }).expect(200)
        .then((response) => {
            expect(response.body.role).toBe('metodist_dec');
            expect(response.body.methodist.faculty_id+"").toBe('123');
        });
});
test("GET /api/user/login {role:student}", async () => {
    await supertest(app).post("/api/user/login").send({
        login: "SolomiaAndrusiv",
        password: "$2y$13$vk1bJDGFTA2PUZw.fAKjK.BV80fh5ToCWI4tU98HhFdatq76o2orK"
    }).expect(200)
        .then((response) => {
            expect(response.body.role).toBe('student');
            expect(response.body.student.faculty_id+"").toBe('123');
        });
});
