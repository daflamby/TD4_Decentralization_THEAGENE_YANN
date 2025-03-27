import { launchOnionRouters } from "./onionRouters/launchOnionRouters";
import { launchRegistry } from "./registry/registry";
import { launchUsers } from "./users/launchUsers";
// index.ts

import { WebCrypto } from 'webcrypto-liner';

// Crée une instance de WebCrypto
const webCrypto = new WebCrypto();

// Ajoute le polyfill globalement
globalThis.crypto = webCrypto;

// Exemple d'utilisation de l'API Web Crypto
const generateKey = async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // La clé peut être exportée
    ["encrypt", "decrypt"]
  );

  console.log("Clé générée :", key);
};

// Appel de la fonction pour générer la clé
generateKey().catch((error) => console.error("Erreur:", error));


export async function launchNetwork(nbNodes: number, nbUsers: number) {
  // launch node registry
  const registry = await launchRegistry();

  // launch all nodes
  const onionServers = await launchOnionRouters(nbNodes);

  // launch all users
  const userServers = await launchUsers(nbUsers);

  return [registry, ...onionServers, ...userServers];
}
