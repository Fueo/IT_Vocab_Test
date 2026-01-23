import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import theme from "../../theme";
import { AppDialog, AppText, HomeHeader, MenuItem } from "../core";
import { DialogType } from "../core/AppDialog";
import HomeLevelCard from "../quiz/core/HomeLevelCard";

import RankBadge from "./core/RankBadge";
import UserAvatar from "./core/UserAvatar";

// auth + stores
import { authApi } from "../../api/auth";
import { tokenStore } from "../../storage/token";

// ✅ Import profileApi (đúng file bạn cung cấp)
import { profileApi } from "../../api/profile";

import { fetchProfile } from "../../store/profileActions";
import { useProfileStore } from "../../store/useProfileStore";

// Import check auth utility
import { requireAuth } from "../../utils/authUtils";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, iconColor }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={theme.iconSizes.lgx} color={iconColor} style={styles.statIcon} />
    <AppText size="lg" weight="bold" color={theme.colors.text.primary}>
      {String(value)}
    </AppText>
    <AppText size="xs" color={theme.colors.text.secondary} style={styles.statLabel}>
      {label}
    </AppText>
  </View>
);

function formatMemberSince(input?: string | null) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

const ProfileView = () => {
  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.isLoading);
  const clearProfile = useProfileStore((s) => s.clear);

  // ✅ Lấy hàm setProfile để cập nhật thủ công vào store
  const setProfile = useProfileStore((s) => s.setProfile);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
    confirmText?: string;
    closeText?: string;
    isDestructive?: boolean;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const handleCloseDialog = () => {
    if (isLoggingOut) return;
    setDialogConfig((prev) => ({ ...prev, visible: false }));
  };

  const isGuest = !profile;

  const goFeedback = () => {
    requireAuth(
      router,
      setDialogConfig,
      () => {
        router.push("/feedback/form");
      },
      {
        title: "Gửi phản hồi",
        message: "Bạn cần đăng nhập để gửi ý kiến đóng góp cho chúng tôi.",
        confirmText: "Đăng nhập"
      }
    );
  };

  const goSettings = () => router.push("/profile/setting");

  const clearSessionAndRedirect = async () => {
    await tokenStore.clearTokens();
    clearProfile();
    handleCloseDialog();
    router.replace("/auth/login");
  };

  const handleProfileError = (error: any) => {
    const status = error?.response?.status;

    if (status === 404 || status === 401) {
      console.log("Profile error: 404/401 detected.");
      setDialogConfig({
        visible: true,
        type: "warning",
        title: "Phiên đăng nhập hết hạn",
        message: "Tài khoản không tìm thấy hoặc phiên đã hết hạn. Vui lòng đăng nhập lại.",
        confirmText: "Đăng nhập lại",
        onConfirm: async () => {
          await clearSessionAndRedirect();
        },
      });
    } else {
      const msg = error?.userMessage || "Không thể tải thông tin cá nhân.";
      setDialogConfig({
        visible: true,
        type: "error",
        title: "Lỗi tải dữ liệu",
        message: msg,
        confirmText: "Đóng",
        onConfirm: handleCloseDialog,
      });
    }
  };

  useEffect(() => {
    const initProfile = async () => {
      if (!profile && !profileLoading) {
        const token = await tokenStore.getAccessToken();
        if (token) {
          fetchProfile().catch((e) => handleProfileError(e));
        }
      }
    };
    initProfile();
  }, [profile, profileLoading]);

  // ✅ LOGIC REFRESH DÙNG profile.ts
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      const token = await tokenStore.getAccessToken();
      if (token) {
        // 1. Gọi API trực tiếp
        // profileApi.getProfile() trả về { message: string, user: ProfileUser }
        const res = await profileApi.getProfile();

        // 2. Set user vào Zustand Store
        if (res && res.user) {
          setProfile(res.user);
        }
      }
    } catch (e: any) {
      handleProfileError(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const performLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const accessToken = await tokenStore.getAccessToken();
      if (accessToken) {
        try {
          await authApi.logout();
        } catch { }
      }
      await clearSessionAndRedirect();
    } catch {
      await clearSessionAndRedirect();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAuthActionPress = () => {
    if (isGuest) {
      setDialogConfig({
        visible: true,
        type: "info",
        title: "Đăng nhập",
        message: "Đăng nhập ngay để lưu tiến độ học tập.",
        confirmText: "Đăng nhập",
        closeText: "Để sau",
        onConfirm: () => {
          handleCloseDialog();
          router.replace("/auth/login");
        }
      });
    } else {
      setDialogConfig({
        visible: true,
        type: "confirm",
        title: "Đăng xuất",
        message: "Bạn có chắc chắn muốn đăng xuất?",
        isDestructive: true,
        confirmText: "Đăng xuất",
        closeText: "Hủy",
        onConfirm: performLogout
      });
    }
  };

  if (profileLoading && !profile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const userName = isGuest ? "Guest User" : (profile?.name?.trim() || "User");
  const avatarUrl = isGuest ? undefined : (profile?.avatarURL || undefined);
  const streak = isGuest ? 0 : (profile?.currentStreak ?? 0);
  const bestStreak = isGuest ? 0 : (profile?.longestStreak ?? 0);
  const lessons = isGuest ? 0 : (profile?.stats?.lessonsDone ?? 0);
  const words = isGuest ? 0 : (profile?.stats?.wordsLearned ?? 0);

  const accuracy = useMemo(() => {
    if (isGuest) return "-";
    const v = profile?.stats?.accuracy;
    return typeof v === "number" ? `${v}%` : "-";
  }, [profile, isGuest]);

  const joinDate = useMemo(() => {
    if (isGuest) return "N/A";
    return formatMemberSince(profile?.memberSince ?? null);
  }, [profile, isGuest]);

  const currentXP = isGuest ? 0 : (profile?.currentXP ?? 0);
  const currentRank = isGuest ? null : (profile?.currentRank ?? null);
  const nextRank = isGuest ? null : (profile?.nextRank ?? null);
  const rankLevel = currentRank?.rankLevel ?? 1;
  const rankKey = rankLevel >= 10 ? "gold" : rankLevel >= 5 ? "silver" : "bronze";

  const frameImageUrl = useMemo(() => {
    if (isGuest) return null;
    return profile?.equippedSkin?.itemImageURL ?? null;
  }, [profile, isGuest]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <HomeHeader
          title="Profile"
          rightIcon="settings-outline"
          onRightIconPress={goSettings}
          showRightIconBackground={false}
          bottomContent={
            <View style={styles.userInfoContainer}>
              <UserAvatar
                initials={userName.charAt(0)}
                size={120}
                imageUrl={avatarUrl}
                frameImageUrl={frameImageUrl}
              >
                <RankBadge rank={rankKey as any} />
              </UserAvatar>

              <AppText size="title" weight="bold" color={theme.colors.text.white} style={styles.userName}>
                {userName}
              </AppText>

              {isGuest && (
                <AppText size="sm" color="rgba(255,255,255,0.8)" style={styles.userEmail}>
                  (Chế độ Khách)
                </AppText>
              )}
            </View>
          }
        />

        <View style={styles.levelCardWrapper}>
          <HomeLevelCard currentXP={currentXP} currentRank={currentRank} nextRank={nextRank} />
        </View>

        <View style={styles.contentSection}>
          <AppText size="lg" weight="bold" color={theme.colors.text.primary} style={styles.sectionTitle}>
            Statistics
          </AppText>

          <View style={styles.statsGrid}>
            <StatCard icon="flame" value={streak} label="Day Streak" iconColor={theme.colors.warning || "#D97706"} />
            <StatCard icon="trophy" value={bestStreak} label="Best Streak" iconColor={theme.colors.warningLight || "#F59E0B"} />
            <StatCard icon="layers" value={lessons} label="Lessons Done" iconColor={theme.colors.secondary} />
            <StatCard icon="bulb" value={words} label="Words Learned" iconColor={theme.colors.warningLight || "#EAB308"} />
          </View>

          <View style={styles.infoCard}>
            <View>
              <AppText size="sm" color={theme.colors.text.secondary}>Overall Accuracy</AppText>
              <AppText size="md" weight="bold" color={theme.colors.secondary} style={styles.infoValue}>{accuracy}</AppText>
            </View>
            <Ionicons name="disc" size={theme.iconSizes.xxl} color={theme.colors.error} />
          </View>

          <View style={styles.infoCard}>
            <View style={styles.rowCenter}>
              <Ionicons name="calendar-outline" size={theme.iconSizes.lg} color={theme.colors.text.secondary} />
              <View style={styles.infoTextContainer}>
                <AppText size="xs" color={theme.colors.text.secondary}>Member since</AppText>
                <AppText size="md" weight="bold" color={theme.colors.text.primary}>{joinDate}</AppText>
              </View>
            </View>
          </View>

          <MenuItem icon="settings-outline" label="Settings" onPress={goSettings} />

          <TouchableOpacity
            style={[
              styles.logoutButton,
              isGuest && { backgroundColor: theme.colors.primary + "10", borderColor: theme.colors.primary },
            ]}
            onPress={handleAuthActionPress}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={isGuest ? theme.colors.primary : theme.colors.error} />
            ) : (
              <>
                <Ionicons
                  name={isGuest ? "log-in-outline" : "log-out-outline"}
                  size={theme.iconSizes.lg}
                  color={isGuest ? theme.colors.primary : theme.colors.error}
                  style={styles.logoutIcon}
                />
                <AppText size="md" weight="bold" color={isGuest ? theme.colors.primary : theme.colors.error}>
                  {isGuest ? "Log In Now" : "Log Out"}
                </AppText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8} onPress={goFeedback}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={theme.iconSizes.lgx} color={theme.colors.text.white} />
        </LinearGradient>
      </TouchableOpacity>

      <AppDialog
        visible={dialogConfig.visible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        closeText={dialogConfig.closeText}
        isDestructive={dialogConfig.isDestructive}
        onClose={handleCloseDialog}
        onConfirm={dialogConfig.onConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.cardBackground },
  loadingContainer: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 100 },
  userInfoContainer: { alignItems: "center", paddingBottom: theme.spacing.lg },
  userName: { marginTop: theme.spacing.lg },
  userEmail: { marginTop: theme.spacing.xs },
  levelCardWrapper: {
    paddingHorizontal: theme.spacing.md,
    marginTop: -30,
    marginBottom: theme.spacing.lg,
    zIndex: 1,
  },
  contentSection: { padding: theme.spacing.md },
  sectionTitle: { marginBottom: theme.spacing.md },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  statCard: {
    width: "48%",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { marginBottom: theme.spacing.sm },
  statLabel: { marginTop: theme.spacing.xs },
  infoCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoValue: { marginTop: theme.spacing.xs },
  infoTextContainer: { marginLeft: theme.spacing.smd },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: "#FEF2F2",
    minHeight: 56,
  },
  logoutIcon: { marginRight: theme.spacing.sm },
  fabContainer: {
    position: "absolute",
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileView;