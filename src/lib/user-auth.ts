import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SECRET = process.env.ADMIN_PASSWORD || "default-secret-key";

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return timingSafeEqual(hashBuffer, derivedKey);
}

export function createUserToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  const signature = scryptSync(payload, SECRET, 32).toString("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64");
  return token;
}

export function verifyUserToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userId, timestamp, signature] = parts;
    const payload = `${userId}:${timestamp}`;
    const expected = scryptSync(payload, SECRET, 32).toString("hex");
    if (signature !== expected) return null;
    // Token expires after 30 days
    const age = Date.now() - parseInt(timestamp);
    if (age > 30 * 24 * 60 * 60 * 1000) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("user_token")?.value;
  if (!token) return null;

  const userId = verifyUserToken(token);
  if (!userId) return null;

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user || null;
}
