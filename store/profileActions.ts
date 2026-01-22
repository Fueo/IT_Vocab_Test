import { profileApi } from "../api/profile";
import { useProfileStore } from "./useProfileStore";

// refetch profile và cập nhật Zustand
export async function fetchProfile(opts?: { silent?: boolean }) {
  const { setLoading, setError, setProfile } = useProfileStore.getState();
  const silent = !!opts?.silent;

  if (!silent) setLoading(true);
  setError(null);

  try {
    const res: any = await profileApi.getProfile();

    // ✅ merge rank nếu API tách riêng (res.rank.*)
    const user = res?.user
      ? {
          ...res.user,
          ...(res.rank?.currentRank !== undefined ? { currentRank: res.rank.currentRank } : {}),
          ...(res.rank?.nextRank !== undefined ? { nextRank: res.rank.nextRank } : {}),

          // ✅ NEW: ensure number + default
          unclaimedRewardsCount: Math.max(
            0,
            Number(res.user?.unclaimedRewardsCount ?? 0)
          ),
        }
      : null;

    setProfile(user);
    return user;
  } catch (e: any) {
    setError(e?.message ?? "Fetch profile failed");
    throw e;
  } finally {
    if (!silent) setLoading(false);
  }
}
