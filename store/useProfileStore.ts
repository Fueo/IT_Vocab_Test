// src/store/useProfileStore.ts
import { create } from "zustand";
import type { NextRankInfo, ProfileUser, RankInfo } from "../api/profile";

type PatchFinishPayload = {
  currentXP: number; // ✅ XP trong rank hiện tại
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  currentRank?: RankInfo | null;
  nextRank?: NextRankInfo | null; // ✅ neededEXP = ngưỡng để lên rank tiếp theo
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

// ✅ helper normalize incremental rank payload
function normalizeProfileLike(
  incoming: ProfileUser,
  prev?: ProfileUser | null
): ProfileUser {
  const currentXP = Math.max(0, Number((incoming as any).currentXP ?? 0));

  // merge rank: nếu incoming không có currentRank/nextRank thì giữ của prev
  const currentRank =
    (incoming as any).currentRank !== undefined
      ? (incoming as any).currentRank
      : prev?.currentRank;

  const rawNextRank =
    (incoming as any).nextRank !== undefined
      ? (incoming as any).nextRank
      : prev?.nextRank;

  const nextRank: NextRankInfo | null | undefined =
    rawNextRank == null
      ? rawNextRank
      : {
          ...(rawNextRank as any),
          neededEXP: Math.max(0, Number((rawNextRank as any).neededEXP ?? 0)),
          remainingEXP: Math.max(
            0,
            Number((rawNextRank as any).neededEXP ?? 0) - currentXP
          ),
        };

  return {
    ...prev,
    ...incoming,
    currentXP,
    ...(currentRank !== undefined ? { currentRank } : {}),
    ...(nextRank !== undefined ? { nextRank } : {}),
  } as ProfileUser;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  // ✅ setProfile: normalize + merge rank (tránh bị fetchProfile ghi đè thành 100/undefined)
  setProfile: (profile) =>
    set((state) => {
      if (!profile) return { profile: null };
      return { profile: normalizeProfileLike(profile, state.profile) };
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // ✅ patchProfile: cũng normalize nếu partial có đụng currentXP/nextRank
  patchProfile: (partial) =>
    set((state) => {
      if (!state.profile) return state;

      const merged = { ...state.profile, ...partial } as ProfileUser;
      return { ...state, profile: normalizeProfileLike(merged, state.profile) };
    }),

  // ✅ patchFromFinish: giữ nguyên (đã đúng)
  patchFromFinish: (p) =>
    set((state) => {
      if (!state.profile) return state;

      const currentXP = Math.max(0, Number(p.currentXP ?? 0));

      const nextRank =
        p.nextRank === undefined
          ? undefined
          : p.nextRank
          ? {
              ...p.nextRank,
              neededEXP: Math.max(0, Number(p.nextRank.neededEXP ?? 0)),
              remainingEXP: Math.max(
                0,
                Number(p.nextRank.neededEXP ?? 0) - currentXP
              ),
            }
          : null;

      return {
        ...state,
        profile: {
          ...state.profile,
          currentXP,
          currentStreak: Number(p.currentStreak ?? 0),
          longestStreak: Number(p.longestStreak ?? 0),
          lastStudyDate: p.lastStudyDate ?? null,
          ...(p.currentRank !== undefined ? { currentRank: p.currentRank } : {}),
          ...(nextRank !== undefined ? { nextRank } : {}),
        },
      };
    }),

  clear: () => set({ profile: null, isLoading: false, error: null }),
}));
