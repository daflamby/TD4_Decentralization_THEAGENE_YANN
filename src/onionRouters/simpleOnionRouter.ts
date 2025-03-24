import express, { Express, Request, Response } from "express";
import { createServer, Server } from "http"; // ✅ Import Server from 'http'
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number): Promise<Server> {
  const onionRouter: Express = express();
  onionRouter.use(express.json());

  onionRouter.get("/status", (req: Request, res: Response) => {
    res.status(200).send({ message: "Onion router is live" });
  });

  onionRouter.post("/relay", (req: Request, res: Response) => {
    const { data, nextNode } = req.body;

    if (!data || !nextNode) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    console.log(`Node ${nodeId} received data:`, data);
    console.log(`Forwarding to next node: ${nextNode}`);

    res.status(200).json({ message: "Data relayed successfully" });
  });

  return new Promise((resolve, reject) => {
    const server: Server = createServer(onionRouter);

    server.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
      console.log(`Onion router ${nodeId} is running on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
      resolve(server);
    });

    server.on("error", (err) => {
      console.error(`Error starting Onion Router ${nodeId}:`, err);
      reject(err);
    });
  });
}
