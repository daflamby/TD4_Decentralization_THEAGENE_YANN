import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());

  // POST route to register nodes
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    // You should have some logic here to store or process the node registration
    // For now, let's just log it
    console.log(`Registering node ${nodeId} with pubKey ${pubKey}`);

    // Ensure that a response is sent back to the client
    return res.status(200).send({ message: "Node registered successfully" });
  });

  // GET route to check the status of the registry
  _registry.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
