// src/api/reward.ts (hoặc bạn đặt ở đâu tuỳ cấu trúc)
import { api } from "./client";

// ===== Types =====

export type RewardType = "ALL" | "RANK" | "STREAK";
export type RewardState = "ALL" | "LOCKED" | "CLAIMABLE" | "CLAIMED";

export type RoadmapQuery = {
  type?: RewardType;
  status?: RewardState;
  page?: number;
  limit?: number; // default backend 10
};

export type RewardItemDto = {
  itemId: string;
  itemName: string;
  itemImageURL?: string | null;
  itemType: string; // nếu bạn có enum thì đổi sang union
  quantity: number;
};

export type RewardClaimInfo = {
  inboxId: string;
} | null;

export type RankMilestoneDto = {
  _id: string;
  type: "RANK";
  level: number;
  name: string;
  rewards: RewardItemDto[];
  state: Exclude<RewardState, "ALL">; // LOCKED | CLAIMABLE | CLAIMED
  claim: RewardClaimInfo;
};

export type StreakMilestoneDto = {
  _id: string;
  type: "STREAK";
  dayNumber: number;
  title: string;
  rewards: RewardItemDto[];
  state: Exclude<RewardState, "ALL">;
  claim: RewardClaimInfo;
};

export type RoadmapMilestoneDto = RankMilestoneDto | StreakMilestoneDto;

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RoadmapRes = {
  guest: boolean;
  pagination: Pagination;
  filter: { type: RewardType; status: RewardState };
  milestones: RoadmapMilestoneDto[];
};

export type ClaimRewardRes = {
  message: string;
  inboxId: string;
  receivedItems: Array<{ itemId: string; quantity: number }>;
};

// ===== API =====

export const rewardApi = {
  /**
   * GET /rewards/roadmap
   * Optional auth: guest vẫn gọi được (client.ts tự gắn Bearer nếu có)
   */
  getRoadmap(params?: RoadmapQuery) {
    return api.get<RoadmapRes>("/reward/roadmap", { params }).then((r) => r.data);
  },

  /**
   * POST /rewards/inbox/:inboxId/claim
   * Private: cần token (client.ts tự gắn Bearer)
   */
  claim(inboxId: string) {
    return api.post<ClaimRewardRes>(`/reward/inbox/${inboxId}/claim`).then((r) => r.data);
  },
};
