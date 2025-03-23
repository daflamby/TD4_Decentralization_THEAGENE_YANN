import request from "supertest"; 
import { simpleOnionRouter } from "C:/Users/yanna/TD4_Decentralization_THEAGENE_YANN/src/onionRouters/simpleOnionRouter.ts";
import { BASE_ONION_ROUTER_PORT } from "C:/Users/yanna/TD4_Decentralization_THEAGENE_YANN/src/config.ts";

let server: ReturnType<typeof simpleOnionRouter>; // Explicit type

beforeAll(async () => {
  server = await simpleOnionRouter(0);
});

afterAll(() => {
  server?.close(); // Ensure the server is properly closed
});
