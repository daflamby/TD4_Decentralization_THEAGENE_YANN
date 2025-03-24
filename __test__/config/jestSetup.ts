import request from "supertest"; 
import { simpleOnionRouter } from "C:/Users/yanna/TD4_Decentralization_THEAGENE_YANN/src/onionRouters/simpleOnionRouter.ts";
import { BASE_ONION_ROUTER_PORT } from "C:/Users/yanna/TD4_Decentralization_THEAGENE_YANN/src/config.ts";
import { Server } from "http";

let server: Server | undefined;

beforeAll(async () => {
  // Wait for the promise to resolve and get the Server instance
  server = await simpleOnionRouter(0);
});

afterAll(() => {
  // Ensure server.close() is called only after the server has been initialized
  if (server) {
    server.close();
  }
});
