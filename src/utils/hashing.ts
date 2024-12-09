import { env } from "@/env";

export const hashtext = async (password: string) => {
  // Generate a random salt
  const salt = env.NEXTAUTH_SECRET;

  // Encode password as UTF-8
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  // Create a key from the password
  const key = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  // Convert derived bits to hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

// Function to verify a password
export const verifyHashText = async (
  password: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> => {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  const key = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const salt = new Uint8Array(
    storedSalt.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex === storedHash;
};
