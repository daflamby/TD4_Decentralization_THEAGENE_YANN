import bodyParser from "body-parser";
import express from "express";
import axios from "axios";
import { REGISTRY_PORT, BASE_ONION_ROUTER_PORT } from "../config";
import { generateRsaKeyPair, exportPrvKey, rsaDecrypt, importSymKey, symDecrypt, exportPubKey } from "../crypto";

let lastReceivedEncryptedMessage: string | null = null;
let lastReceivedDecryptedMessage: string | null = null;
let lastMessageDestination: number | null = null;

async function generateKeyPair() {
  // Placeholder for key generation logic (you can replace it with actual implementation)
  const publicKey = "publicKeyString"; // Replace with actual public key generation logic
  const privateKey = "privateKeyString"; // Replace with actual private key generation logic
  return { publicKey, privateKey };
}

export async function simpleOnionRouter(nodeId: number) {
  // Génération de la paire de clés RSA pour ce nœud
  const { publicKey, privateKey } = await generateRsaKeyPair();

  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Enregistrement du nœud sur le registre
  await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    nodeId,
    pubKey: await exportPubKey(publicKey),  // Exportation de la clé publique pour le registre
  });

  // Route de statut
  onionRouter.get("/status", (req, res) => {
    res.status(200).send("live");
  });

  // Route pour obtenir le dernier message chiffré reçu
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.status(200).json({ result: lastReceivedEncryptedMessage });
  });

  // Route pour obtenir le dernier message déchiffré reçu
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.status(200).json({ result: lastReceivedDecryptedMessage });
  });

  // Route pour obtenir la destination du dernier message
  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.status(200).json({ result: lastMessageDestination });
  });

  // Route pour recevoir un message
  onionRouter.post("/message", async (req, res) => {
    const { message } = req.body;
    lastReceivedEncryptedMessage = message;

    // Décryptage de la clé symétrique RSA
    const rsaEncryptedKey = message.slice(0, 344); // Taille du RSA en base64 (par exemple 344)
    const symEncryptedMessage = message.slice(344);

    // Décryptage de la clé symétrique avec la clé privée
    const decryptedSymKey = await rsaDecrypt(rsaEncryptedKey, privateKey);  // Décryptage avec la clé privée

    // Importation de la clé symétrique
    const symmetricKey = await importSymKey(decryptedSymKey);

    // Décryptage du message avec la clé symétrique
    const decryptedMessage = await symDecrypt(symmetricKey, symEncryptedMessage);
    lastReceivedDecryptedMessage = decryptedMessage;

    // Extraction de la destination et du message réel
    const destination = parseInt(decryptedMessage.slice(0, 10), 10);
    const actualMessage = decryptedMessage.slice(10);
    lastMessageDestination = destination;

    // Envoi du message au prochain nœud
    await axios.post(`http://localhost:${destination}/message`, { message: actualMessage });

    res.status(200).send("Message forwarded");
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
