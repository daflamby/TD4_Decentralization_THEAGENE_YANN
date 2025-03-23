import express from "express";
import bodyParser from "body-parser"; // This line is actually unnecessary
import { BASE_ONION_ROUTER_PORT } from "../config";

// This function starts the onion router server
export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();

  // Use express built-in middleware for JSON parsing
  onionRouter.use(express.json()); // This is enough; no need for bodyParser

  // Implement the /status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  // Start the server on the port determined by BASE_ONION_ROUTER_PORT + nodeId
  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
