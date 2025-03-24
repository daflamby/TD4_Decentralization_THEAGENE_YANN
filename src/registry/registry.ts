import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import * as crypto from "../crypto";  
export type Node = {
   nodeId: number; 
   pubKey: string; 
   prvKey?: string; 
  };

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
  _registry.use(bodyParser.json());
  let nodes: Node[] = []; // Initialize nodes as an empty array of type Node[]


  _registry.get("/getPrivateKey", (req, res) => { 
    const { nodeId } = req.query;
    const node = nodes.find(node => node.nodeId === Number(nodeId));
    if (node && node.prvKey) {
      res.json({ result: node.prvKey });
    } else {
      res.status(404).send('Node not found or private key unavailable.');
    }
  });

  _registry.get("/getNodeRegistry", (req, res) => {
    const publicNodes = nodes.map(({ nodeId, pubKey }) => ({ nodeId, pubKey }));
    res.json({ nodes: publicNodes });
  });
    // TODO implement the status route
  _registry.get("/status", (req, res) => {
    res.send("live"); 
  });

  _registry.post("/registerNode",async (req, res) =>  {
    const { nodeId, pubKey } = req.body;
    // For testing: Generate a key pair, export the private key, and replace the public key with the provided one
    const { publicKey, privateKey } = await crypto.generateRsaKeyPair();
    const exportedPrvKey = await crypto.exportPrvKey(privateKey);
    nodes.push({ nodeId, pubKey, prvKey: exportedPrvKey || "" }); // Store the private key for testing purposes
    console.log(`Registering node ${nodeId} with public key`);
    res.status(200).json({ result: "Node registered successfully" });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
