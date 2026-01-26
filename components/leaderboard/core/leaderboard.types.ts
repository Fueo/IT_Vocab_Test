export type TabKey = "XP" | "Streak";

export const RANK_COLORS = {
    gold: { main: "#FFD700", gradient: ["#FFD200", "#F7971E"] as [string, string] },
    silver: { main: "#C0C0C0", gradient: ["#BDC3C7", "#2C3E50"] as [string, string] },
    bronze: { main: "#CD7F32", gradient: ["#DAA520", "#8B4513"] as [string, string] },
};

export type LeaderboardItem = {
    id: string;              // userID
    rank: number;            // 1..10
    name: string;

    avatarURL: string | null;

    value: number;              // nếu tab=XP thì value, còn lại 0
    streak: number;          // nếu tab=Streak thì value, còn lại 0

    rankLevel: number | null;
    itemImageURL: string | null; // top3 mới có
};
