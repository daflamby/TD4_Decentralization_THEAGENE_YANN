import express from "express";
import bodyParser from "body-parser"; // This line is actually unnecessary
import { BASE_ONION_ROUTER_PORT } from "../config";

// This function starts the onion router server
export async function simpleOnionRouter(nodeId: number): Promise<Server> {
  const onionRouter = express();

  // Middleware and routes setup
  onionRouter.use(express.json());

  // Implement the /status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  // Start the server on the specified port
  return new Promise((resolve, reject) => {
    const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
      console.log(
        `Onion router ${nodeId} is listening on port ${
          BASE_ONION_ROUTER_PORT + nodeId
        }`
      );
      resolve(server); // Resolve the promise with the server
    });

    // Reject if an error occurs
    server.on("error", (err) => reject(err));
  });
}
