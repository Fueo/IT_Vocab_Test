// src/api/profile.ts
import { guestStore } from "@/storage/guest";
import { tokenStore } from "@/storage/token";
import { api } from "./client";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ===== Types theo backend getProfile response mới =====

export type CurrentRankInfo = {
  rankLevel: number;
  rankName: string;
};

export type NextRankInfo = {
  neededXP: number;
  remainingXP: number;
};

export type EquippedSkinInfo = {
  slotType: string; // "SKIN" | "FRAME" | ... (tuỳ BE)
  itemName: string;
  itemImageURL: string | null;
};

export type ProfileStats = {
  lessonsDone: number;
  wordsLearned: number;
  accuracy: number; // %
};

export type ProfileUser = {
  userId: string;
  name: string | null;
  avatarURL: string | null;
  phone: string | null;

  currentXP: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;

  currentRank: CurrentRankInfo | null;
  nextRank: NextRankInfo | null;

  equippedSkin: EquippedSkinInfo | null;

  stats: ProfileStats;
  memberSince: string | null;

  unclaimedRewardsCount: number; // BE trả về number
};

export type GetProfileRes = {
  message: string;
  user: ProfileUser;
};

export type UpdateProfileBody = {
  // BE: null => clear field; undefined => không update
  name?: string | null;
  phone?: string | null;
};

export type UpdateProfileRes = {
  message: string;
  user: {
    userId: string;
    name: string | null;
    phone: string | null;
    avatarURL: string | null;
  };
};

export type UpdateAvatarRes = {
  message: string;
  user: {
    userId: string;
    avatarURL: string | null;
  };
};

function guessMime(uri: string) {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return { type: "image/png", name: "avatar.png" };
  if (lower.endsWith(".webp")) return { type: "image/webp", name: "avatar.webp" };
  return { type: "image/jpeg", name: "avatar.jpg" };
}

// ===== API =====
export const profileApi = {
  // GET /profile (JWT)
  getProfile(): Promise<GetProfileRes> {
    return api.get<GetProfileRes>("/profile").then((r) => r.data);
  },

  // PUT /profile (JWT)
  updateProfile(body: UpdateProfileBody): Promise<UpdateProfileRes> {
    return api.put<UpdateProfileRes>("/profile", body).then((r) => r.data);
  },

  // PUT /profile/avatar (JWT, multipart/form-data)
  async updateAvatar(file: { uri: string; name?: string; type?: string }): Promise<UpdateAvatarRes> {
    // fallback name/type nếu caller không truyền
    const meta = file.type && file.name ? { type: file.type, name: file.name } : guessMime(file.uri);

    // 1️⃣ "mồi" 1 request nhẹ để interceptor refresh token (nếu có)
    try {
      await api.get("/profile");
    } catch (err) {
      throw err;
    }

    // 2️⃣ token đã được refresh (nếu cần)
    const token = await tokenStore.getAccessToken();
    const guestKey = await guestStore.get();

    // 3️⃣ FormData
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      type: meta.type,
      name: meta.name,
    } as any);

    // 4️⃣ fetch upload
    const res = await fetch(`${baseURL}/profile/avatar`, {
      method: "PUT",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(guestKey ? { "x-guest-key": guestKey } : {}),
        // KHÔNG set Content-Type để fetch tự set boundary
      },
      body: form as any,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      throw new Error(data?.message || `Upload failed (${res.status})`);
    }

    return data as UpdateAvatarRes;
  },
};
