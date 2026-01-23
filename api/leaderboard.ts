// src/api/leaderboard.ts
import { api } from "./client";

// ===== Types =====
export type LeaderboardTab = "xp" | "streak";

export type LeaderboardUser = {
    userID: string;
    rank: number; // 1..10
    name: string;
    avatarURL: string | null;
    value: number; // currentXP hoặc currentStreak

    rankLevel: number | null; // từ Rank.rankLevel (current rank)
    itemImageURL: string | null; // chỉ top 3, còn lại null
};

export type LeaderboardRes = {
    userList: LeaderboardUser[];
    position: number | null; // chỉ có khi có token (và với streak thì phải có study hôm nay)
};

// ===== API =====
export const leaderboardApi = {
    // GET /leaderboard/:tab
    // tab: "xp" | "streak"
    get(tab: LeaderboardTab) {
        return api.get<LeaderboardRes>(`/leaderboard/${tab}`).then((r) => r.data);
    },
};
