// Wiki URL
let server = 'https://azurlane.koumakan.jp';

// Setting supertest in order to test the URL
let request = require("supertest")
request = request(server)

// close the server after each test
afterAll(async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 500));
});

describe("Azur Lane Wiki", () => {
    test("should actually be online", async () => {
        request.get('/').expect(200);
    });
});
