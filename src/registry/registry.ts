import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

// Define the Node type to hold node information
export type Node = { nodeId: number; pubKey: string };

// Define the body for registering a node
export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

// Define the response structure for getting nodes
export type GetNodeRegistryBody = {
  nodes: Node[];
};

let nodeRegistry: Node[] = []; // In-memory registry to store nodes

export async function launchRegistry() {
  const _registry = express();

  // Use express built-in middleware for JSON parsing
  _registry.use(express.json());

  // Implement the /status route that returns "live"
  _registry.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  // Implement the /registerNode route to allow nodes to register
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    // Check if nodeId already exists in the registry
    const existingNode = nodeRegistry.find((node) => node.nodeId === nodeId);
    if (existingNode) {
      return res.status(400).send("Node with this ID already exists.");
    }

    // Add new node to the registry
    nodeRegistry.push({ nodeId, pubKey });
    res.status(201).send(`Node ${nodeId} registered successfully.`);
  });

  // Implement the /getNodeRegistry route to retrieve all nodes
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    const response: GetNodeRegistryBody = { nodes: nodeRegistry };
    res.json(response);
  });

  // Start the server and log a message to indicate it's running
  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry server is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
