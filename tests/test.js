const app = require("../setup");
const supertest = require("supertest");

test("GET /", async () => {
    await supertest(app).get("/").expect(200)
        .then((response) => {
            expect(response.body.message).toBe("ok");

        });
});






