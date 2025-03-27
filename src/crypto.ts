import { TextEncoder, TextDecoder } from "util";

// Fonction pour générer une paire de clés RSA
export async function generateRsaKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return keyPair;
}

// Fonction pour exporter la clé publique en format JWK (JSON Web Key)
export async function exportPubKey(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("jwk", publicKey);
  return JSON.stringify(exported); // Retourner la clé publique sous forme de chaîne JSON
}

// Fonction pour exporter la clé privée en format JWK
export async function exportPrvKey(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("jwk", privateKey);
  return JSON.stringify(exported); // Retourner la clé privée sous forme de chaîne JSON
}

// Fonction pour importer une clé privée à partir d'une chaîne JWK
export async function importPrvKey(jwk: string): Promise<CryptoKey> {
  const keyObj = JSON.parse(jwk);
  const importedKey = await crypto.subtle.importKey(
    "jwk",
    keyObj,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
  return importedKey;
}

// Fonction pour importer une clé publique à partir d'une chaîne JWK
export async function importPubKey(jwk: string): Promise<CryptoKey> {
  const keyObj = JSON.parse(jwk);
  const importedKey = await crypto.subtle.importKey(
    "jwk",
    keyObj,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
  return importedKey;
}

// Fonction pour effectuer un chiffrement RSA avec la clé publique
export async function rsaEncrypt(message: string, publicKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  const encryptedMessage = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedMessage
  );

  return Buffer.from(encryptedMessage).toString("base64");
}

// Fonction pour effectuer un déchiffrement RSA avec la clé privée
export async function rsaDecrypt(encryptedMessage: string, privateKey: CryptoKey): Promise<string> {
  const encryptedData = Buffer.from(encryptedMessage, "base64");
  const decryptedData = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

// Fonction pour générer une clé symétrique aléatoire
export async function createRandomSymmetricKey() {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Fonction pour exporter une clé symétrique au format raw (utilisable pour le chiffrement)
export async function exportSymKey(key: CryptoKey): Promise<string> {
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return Buffer.from(exportedKey).toString("base64");
}

// Fonction pour importer une clé symétrique à partir du format raw
export async function importSymKey(rawKey: string): Promise<CryptoKey> {
  const keyBuffer = Buffer.from(rawKey, "base64");
  const importedKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
  return importedKey;
}

// Fonction pour effectuer un chiffrement symétrique AES
export async function symEncrypt(key: CryptoKey, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialisation vector pour AES-GCM

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  const encryptedBuffer = Buffer.from(encryptedData);
  return iv.toString("base64") + ":" + encryptedBuffer.toString("base64");
}

// Fonction pour effectuer un déchiffrement symétrique AES
export async function symDecrypt(key: CryptoKey, encryptedData: string): Promise<string> {
  const [ivBase64, encryptedBase64] = encryptedData.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const encryptedBuffer = Buffer.from(encryptedBase64, "base64");

  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}
