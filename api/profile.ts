// src/api/profile.ts
import { api } from "./client";

// ===== Types theo backend profile.controller.js =====

export type RankInfo = {
  rankId: string;
  rankLevel: number;
  rankName: string;
  neededEXP: number;
};

export type NextRankInfo = RankInfo & {
  remainingEXP: number;
};

export type SkinInfo = {
  inventoryId: string;
  itemId: string;
  itemName: string;
  itemImageURL: string;
  quantity: number;
  activatedAt: string | null;
  expiredAt: string | null;
  isActive: boolean;
};

export type ProfileUser = {
  userId: string;
  name: string | null;
  avatarURL: string | null;
  phone: string | null;
  

  // streak/xp
  currentXP: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;

  // rank
  currentRank: RankInfo | null;
  nextRank: NextRankInfo | null;

  // skin
  skins: SkinInfo[];
  activeSkin: SkinInfo | null;

  stats?: ProfileStats;
  memberSince?: string | null;
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

export type ProfileStats = {
  lessonsDone: number;
  wordsLearned: number;
  accuracy: number; // %
};

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
  // upload.js thường đi kèm upload.single("file") => field name là "file"
  updateAvatar(file: File | Blob, filename?: string): Promise<UpdateAvatarRes> {
    const form = new FormData();

    if (file instanceof File) form.append("file", file);
    else form.append("file", file, filename ?? "avatar.jpg");

    return api
      .put<UpdateAvatarRes>("/profile/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
