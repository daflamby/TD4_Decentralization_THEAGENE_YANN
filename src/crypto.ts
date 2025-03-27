import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############
// Importation de la clé à partir d'une chaîne (ex. base64)
export async function importKey(key: string): Promise<CryptoKey> {
  const importedKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(atob(key)), // ou convertissez de base64 à l'objet
    { name: "RSA-OAEP", hash: { name: "SHA-256" } },
    true,
    ["decrypt", "encrypt"]
  );
  return importedKey;
}

// Exportation de la clé publique en base64 (par exemple)
export async function exportPubKey(publicKey: CryptoKey): Promise<string> {
  const exportedKey = await crypto.subtle.exportKey("spki", publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey))); // base64 encoding
}

// Exportation de la clé privée en base64 (par exemple)
export async function exportPrvKey(privateKey: CryptoKey): Promise<string> {
  const exportedKey = await crypto.subtle.exportKey("pkcs8", privateKey);
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey))); // base64 encoding
}

// Déchiffrement RSA
export async function rsaDecrypt(encrypted: string, privateKey: string): Promise<string> {
  const privKey = await importKey(privateKey);  // Importation de la clé privée
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privKey,
    new Uint8Array(atob(encrypted).split("").map((c) => c.charCodeAt(0)))
  );
  return new TextDecoder().decode(decryptedBuffer);
}

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

export type GenerateRsaKeyPair = {
  publicKey: string;  // Base64 format
  privateKey: string; // Base64 format
};

// Generates an RSA key pair and exports in Base64
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const keyPair = await webcrypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return {
    publicKey: await exportPubKey(keyPair.publicKey),
    privateKey: await exportPrvKey(keyPair.privateKey),
  };
}

// Export a crypto public key to Base64 string
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

// Export a crypto private key to Base64 string
export async function exportPrvKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("pkcs8", key);
  return arrayBufferToBase64(exported);
}

// Import a Base64 string public key
export async function importPubKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const buffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
    "spki",
    buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

// Import a Base64 string private key
export async function importPrvKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const buffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
    "pkcs8",
    buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(data: string, strPublicKey: string): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);
  const encodedData = new TextEncoder().encode(data);
  const encrypted = await webcrypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedData
  );
  return arrayBufferToBase64(encrypted);
}

// Decrypt a message using an RSA private key
export async function rsaDecrypt(data: string, strPrivateKey: string): Promise<string> {
  const privateKey = await importPrvKey(strPrivateKey);
  const buffer = base64ToArrayBuffer(data);
  const decrypted = await webcrypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    buffer
  );
  return new TextDecoder().decode(decrypted);
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random AES-256 key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  return await webcrypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export a crypto symmetric key to Base64 string
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

// Import a Base64 string as a symmetric key
export async function importSymKey(strKey: string): Promise<webcrypto.CryptoKey> {
  const buffer = base64ToArrayBuffer(strKey);
  return await webcrypto.subtle.importKey(
    "raw",
    buffer,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt a message using AES-GCM
export async function symEncrypt(key: webcrypto.CryptoKey, data: string): Promise<string> {
  const encodedData = new TextEncoder().encode(data);
  const iv = webcrypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
  const encrypted = await webcrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );
  return arrayBufferToBase64(iv) + ":" + arrayBufferToBase64(encrypted);
}

// Decrypt a message using AES-GCM
export async function symDecrypt(strKey: string, encryptedData: string): Promise<string> {
  const [ivBase64, dataBase64] = encryptedData.split(":");
  const iv = base64ToArrayBuffer(ivBase64);
  const encrypted = base64ToArrayBuffer(dataBase64);
  const key = await importSymKey(strKey);

  const decrypted = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}
