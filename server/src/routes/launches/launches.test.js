const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

//Testing EndPoints: GET

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  //Testing EndPoints : POST
  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "ZUZ 156",
      target: "Kepler-452 b",
      launchDate: "January 4, 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "ZUZ 156",
      target: "Kepler-452 b",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "ZUZ 156",
      target: "Kepler-452 b",
      launchDate: "zoot",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect(201)
        .expect("Content-Type", /json/);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);

      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    //Error cases

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect(400)
        .expect("Content-Type", /json/);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
