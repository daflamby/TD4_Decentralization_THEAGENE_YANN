import request from "supertest"; // HTTP request library for testing
import { simpleOnionRouter } from "../src/onionRouters/simpleOnionRouter";
import { BASE_ONION_ROUTER_PORT } from "../src/config";

describe("SimpleOnionRouter", () => {
  let server;

  // Start the server before all tests
  beforeAll(async () => {
    server = await simpleOnionRouter(1); // Start a server for nodeId 1
  });

  // Stop the server after tests
  afterAll(() => {
    server.close();
  });

  // Test the /status route
  test("Can access /status and get live response", async () => {
    const response = await request(`http://localhost:${BASE_ONION_ROUTER_PORT + 1}`)
      .get("/status");

    expect(response.status).toBe(200);
    expect(response.text).toBe("live");
  });
});

