import * as Crypto from "expo-crypto";
import { guestStore } from "../storage/guest";
import { tokenStore } from "../storage/token";

export async function ensureGuestKey(): Promise<string> {
  // nếu đang login thật thì không cần guest key
  const access = await tokenStore.getAccessToken();
  if (access) {
    const existed = await guestStore.get();
    if (existed) await guestStore.clear();
    throw new Error("User is logged in; guest key not needed.");
  }

  const existed = await guestStore.get();
  if (existed) return existed;

  const key = Crypto.randomUUID();
  await guestStore.set(key);
  return key;
}
