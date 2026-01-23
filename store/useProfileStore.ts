// src/store/useProfileStore.ts
import { create } from "zustand";
import type { CurrentRankInfo, NextRankInfo, ProfileUser } from "../api/profile";

type PatchFinishPayload = {
  currentXP: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;

  currentRank?: CurrentRankInfo | null;
  nextRank?: NextRankInfo | null;
};

type ProfileState = {
  profile: ProfileUser | null;
  isLoading: boolean;
  error: string | null;

  setProfile: (p: ProfileUser | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;

  patchProfile: (partial: Partial<ProfileUser>) => void;
  patchFromFinish: (p: PatchFinishPayload) => void;

  clear: () => void;
};

// ✅ helper normalize payload theo BE mới
function normalizeProfileLike(incoming: ProfileUser, prev?: ProfileUser | null): ProfileUser {
  const currentXP = Math.max(0, Number((incoming as any).currentXP ?? 0));

  // currentRank: nếu incoming không có (undefined) thì giữ prev
  const currentRank =
    (incoming as any).currentRank !== undefined ? (incoming as any).currentRank : prev?.currentRank;

  // nextRank: nếu incoming không có (undefined) thì giữ prev
  const rawNextRank =
    (incoming as any).nextRank !== undefined ? (incoming as any).nextRank : prev?.nextRank;

  const nextRank: NextRankInfo | null | undefined =
    rawNextRank == null
      ? rawNextRank
      : {
        neededXP: Math.max(0, Number((rawNextRank as any).neededXP ?? 0)),
        remainingXP: Math.max(0, Number((rawNextRank as any).remainingXP ?? 0)),
      };

  // ✅ normalize unclaimedRewardsCount
  const unclaimedRewardsCount =
    (incoming as any).unclaimedRewardsCount !== undefined
      ? Math.max(0, Number((incoming as any).unclaimedRewardsCount ?? 0))
      : (prev as any)?.unclaimedRewardsCount ?? 0;

  return {
    ...prev,
    ...incoming,
    currentXP,
    unclaimedRewardsCount,
    ...(currentRank !== undefined ? { currentRank } : {}),
    ...(nextRank !== undefined ? { nextRank } : {}),
  } as ProfileUser;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  // ✅ setProfile: normalize + merge để tránh bị ghi đè sai
  setProfile: (profile) =>
    set((state) => {
      if (!profile) return { profile: null };
      return { profile: normalizeProfileLike(profile, state.profile) };
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // ✅ patchProfile: merge rồi normalize (giữ nextRank/currentRank nếu partial không có)
  patchProfile: (partial) =>
    set((state) => {
      if (!state.profile) return state;

      const merged = { ...state.profile, ...partial } as ProfileUser;
      return { ...state, profile: normalizeProfileLike(merged, state.profile) };
    }),

  // ✅ patchFromFinish: nhận rank payload mới (neededXP/remainingXP)
  patchFromFinish: (p) =>
    set((state) => {
      if (!state.profile) return state;

      const currentXP = Math.max(0, Number(p.currentXP ?? 0));

      const nextRank =
        p.nextRank === undefined
          ? undefined
          : p.nextRank
            ? {
              neededXP: Math.max(0, Number(p.nextRank.neededXP ?? 0)),
              remainingXP: Math.max(0, Number(p.nextRank.remainingXP ?? 0)),
            }
            : null;

      const currentRank =
        p.currentRank === undefined
          ? undefined
          : p.currentRank
            ? {
              rankLevel: Number(p.currentRank.rankLevel ?? 0),
              rankName: String(p.currentRank.rankName ?? ""),
            }
            : null;

      return {
        ...state,
        profile: {
          ...state.profile,
          currentXP,
          currentStreak: Math.max(0, Number(p.currentStreak ?? 0)),
          longestStreak: Math.max(0, Number(p.longestStreak ?? 0)),
          lastStudyDate: p.lastStudyDate ?? null,
          ...(currentRank !== undefined ? { currentRank } : {}),
          ...(nextRank !== undefined ? { nextRank } : {}),
        },
      };
    }),

  clear: () => set({ profile: null, isLoading: false, error: null }),
}));
