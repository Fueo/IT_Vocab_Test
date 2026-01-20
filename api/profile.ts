// src/api/profile.ts
import { guestStore } from "@/storage/guest";
import { tokenStore } from "@/storage/token";
import { api } from "./client";

// ===== Types theo backend profile.controller.js =====
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;


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

  // ✅ backend đang trả về luôn (không optional)
  stats: ProfileStats;
  memberSince: string | null;
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
// PUT /profile/avatar
  async updateAvatar(file: { uri: string; name: string; type: string }) {
    
    // 1️⃣ MẸO: Gọi "mồi" một request nhẹ bằng Axios trước
    // Mục đích: Để interceptor của Axios kiểm tra xem token còn hạn không.
    // Nếu hết hạn, nó tự refresh và lưu token mới vào store.
    try {
       // Gọi getProfile hoặc một api nhẹ bất kỳ. 
       // Ta không cần data trả về, chỉ cần nó không lỗi 401.
       await api.get("/profile"); 
    } catch (err) {
       // Nếu Axios đã retry refresh mà vẫn lỗi -> Nghĩa là hết hạn hẳn -> Throw luôn
       throw err; 
    }

    // 2️⃣ Lúc này đảm bảo Token trong store là hàng xịn
    const token = await tokenStore.getAccessToken();
    const guestKey = await guestStore.get();

    // 3️⃣ Chuẩn bị FormData
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    // 4️⃣ Gọi Fetch (chỉ chạy 1 lần, không cần lo refresh nữa)
    const res = await fetch(`${baseURL}/profile/avatar`, {
      method: "PUT",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(guestKey ? { "x-guest-key": guestKey } : {}),
        // Để fetch tự set boundary, KHÔNG set Content-Type thủ công
      },
      body: form as any,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || `Upload failed (${res.status})`);
    }
    
    return data;
  }
};
