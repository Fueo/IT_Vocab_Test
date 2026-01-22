// core/rewards.data.ts
export type RewardType = "frame" | "consumable" | "badge";
export type RewardState = "locked" | "claimable" | "claimed";

export type RewardItem = {
  itemId: string;
  itemName: string;
  itemImageURL?: string | null;
  itemType: string;
  quantity: number;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  type: RewardType;

  // frame
  frameId?: "frame1" | "frame2" | "frame3" | "frame4" | "frame5" | "frame6";

  // consumable/badge icon
  icon?: string;

  // milestone meta
  requirementText: string; // vd: "Reach Level 10"

  // ✅ từ server (roadmap)
  state: RewardState;
  claimInboxId?: string | null;

  // ✅ optional: list item thật sự của milestone (nếu muốn show detail)
  items?: RewardItem[];
};

export type RewardSectionKey = "level" | "streak" | "leaderboard";
export type RewardSection = {
  key: RewardSectionKey;
  title: string;
  subtitle: string;
  rewards: Reward[];
};
