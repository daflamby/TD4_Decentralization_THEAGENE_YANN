import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey, rsaDecrypt, importSymKey, symDecrypt } from "../crypto"; // Assurez-vous d'importer exportPubKey

// Variables pour stocker les derniers messages reçus et envoyés
let lastReceivedEncryptedMessage: string | null = null;
let lastReceivedDecryptedMessage: string | null = null;
let lastMessageDestination: number | null = null;

async function generateKeyPair() {
  const keyPair = await generateRsaKeyPair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function simpleOnionRouter(nodeId: number) {
  const { publicKey, privateKey } = await generateKeyPair();

  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Enregistrer le nœud auprès du registre
  await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    nodeId,
    pubKey: await exportPubKey(publicKey),  // Appel à exportPubKey pour obtenir la clé publique sous forme de chaîne
  });

  onionRouter.get("/status", (req, res) => {
    res.status(200).send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.status(200).json({ result: lastReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.status(200).json({ result: lastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.status(200).json({ result: lastMessageDestination });
  });

  onionRouter.post("/message", async (req, res) => {
    const { message } = req.body;
    lastReceivedEncryptedMessage = message;

    // Déchiffrer la clé symétrique RSA
    const rsaEncryptedKey = message.slice(0, 344); // Ajustez la taille selon votre clé RSA
    const symEncryptedMessage = message.slice(344);
    const decryptedSymKey = await rsaDecrypt(rsaEncryptedKey, privateKey);

    // Importer la clé symétrique et déchiffrer le message
    const symmetricKey = await importSymKey(decryptedSymKey);
    const decryptedMessage = await symDecrypt(symmetricKey, symEncryptedMessage);
    lastReceivedDecryptedMessage = decryptedMessage;

    // Extraire la destination et le message réel
    const destination = parseInt(decryptedMessage.slice(0, 10), 10);
    const actualMessage = decryptedMessage.slice(10);
    lastMessageDestination = destination;

    // Forward le message vers la prochaine destination
    await axios.post(`http://localhost:${destination}/message`, { message: actualMessage });

    res.status(200).send("Message forwarded");
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
  });

  return server;
}
import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPrvKey, rsaDecrypt, importSymKey, symDecrypt, exportPubKey  } from "../crypto";

// Variables pour stocker les derniers messages reçus et envoyés
let lastReceivedEncryptedMessage: string | null = null;
let lastReceivedDecryptedMessage: string | null = null;
let lastMessageDestination: number | null = null;

async function generateKeyPair() {
  const keyPair = await generateRsaKeyPair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function simpleOnionRouter(nodeId: number) {
  const { publicKey, privateKey } = await generateKeyPair();

  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Enregistrer le nœud auprès du registre
  await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    nodeId,
    pubKey: await exportPubKey(publicKey),
  });

  onionRouter.get("/status", (req, res) => {
    res.status(200).send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.status(200).json({ result: lastReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.status(200).json({ result: lastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.status(200).json({ result: lastMessageDestination });
  });

  onionRouter.post("/message", async (req, res) => {
    const { message } = req.body;
    lastReceivedEncryptedMessage = message;

    // Déchiffrer la clé symétrique RSA
    const rsaEncryptedKey = message.slice(0, 344); // Ajustez la taille selon votre clé RSA
    const symEncryptedMessage = message.slice(344);
    const decryptedSymKey = await rsaDecrypt(rsaEncryptedKey, privateKey);

    // Importer la clé symétrique et déchiffrer le message
    const symmetricKey = await importSymKey(decryptedSymKey);
    const decryptedMessage = await symDecrypt(symmetricKey, symEncryptedMessage);
    lastReceivedDecryptedMessage = decryptedMessage;

    // Extraire la destination et le message réel
    const destination = parseInt(decryptedMessage.slice(0, 10), 10);
    const actualMessage = decryptedMessage.slice(10);
    lastMessageDestination = destination;

    // Forward le message vers la prochaine destination
    await axios.post(`http://localhost:${destination}/message`, { message: actualMessage });

    res.status(200).send("Message forwarded");
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
  });

  return server;
}
