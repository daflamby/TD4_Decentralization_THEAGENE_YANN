import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

// Définition du type Node (Nœud avec un ID et une clé publique)
export type Node = { nodeId: number; pubKey: string };

// Corps de la requête pour l'enregistrement d'un nœud
export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

// Corps de la requête pour récupérer tous les nœuds enregistrés
export type GetNodeRegistryBody = {
  nodes: Node[];
};

// Tableau contenant les nœuds enregistrés
let nodeRegistry: Node[] = [];

// Fonction pour lancer le serveur du registre
export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Route pour vérifier l'état du registre
  _registry.get("/status", (req, res) => {
    res.status(200).send("Registry live");
  });

  // Route pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey } = req.body as RegisterNodeBody;
    // Vérification si le nœud est déjà enregistré
    const nodeExists = nodeRegistry.some((node) => node.nodeId === nodeId);
    if (nodeExists) {
      return res.status(400).send("Node already registered.");
    }
    // Ajouter le nœud au registre
    nodeRegistry.push({ nodeId, pubKey });
    res.status(200).send("Node registered successfully");
  });

  // Route pour récupérer la liste des nœuds enregistrés
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.status(200).json({ nodes: nodeRegistry });
  });

  // Démarrer le serveur sur le port défini dans REGISTRY_PORT
  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry server is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}

