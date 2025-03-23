import request from "supertest"; 
import { simpleOnionRouter } from "../src/onionRouters/simpleOnionRouter";
import { BASE_ONION_ROUTER_PORT } from "../src/config";

let server: ReturnType<typeof simpleOnionRouter>; // Explicit type

beforeAll(async () => {
  server = await simpleOnionRouter(0);
});

afterAll(() => {
  server?.close(); // Ensure the server is properly closed
});
