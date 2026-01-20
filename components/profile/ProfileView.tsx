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
import HomeLevelCard from "../quiz/core/HomeLevelCard";

import RankBadge from "./core/RankBadge";
import UserAvatar from "./core/UserAvatar";

// auth + stores
import { authApi } from "../../api/auth";
import { guestStore } from "../../storage/guest";
import { tokenStore } from "../../storage/token";

import { fetchProfile } from "../../store/profileActions";
import { useProfileStore } from "../../store/useProfileStore";

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

  // hiển thị kiểu: Jan 2026
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

const ProfileView = () => {
  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.isLoading);
  const profileError = useProfileStore((s) => s.error);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const goFeedback = () => router.push("/profile/send-feedback");
  const goSettings = () => router.push("/profile/setting");

  const openLogout = () => setShowLogoutDialog(true);
  const closeLogout = () => {
    if (isLoggingOut) return;
    setShowLogoutDialog(false);
  };

  // fetch lần đầu nếu chưa có profile
  useEffect(() => {
    if (!profile && !profileLoading) {
      fetchProfile().catch(() => {});
    }
  }, [profile, profileLoading]);

  // pull-to-refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProfile({ silent: true });
    } finally {
      setIsRefreshing(false);
    }
  };

  // logout
  const confirmLogOut = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const accessToken = await tokenStore.getAccessToken(); // ✅ theo tokenStore dạng get()/clear()
      const guestKey = await guestStore.get();

      if (accessToken) {
        await authApi.logout();
      } else {
        if (guestKey) await guestStore.clear();
      }

      setShowLogoutDialog(false);
      router.replace("/auth/login");
    } catch (e) {
      await tokenStore.clearTokens();
      await guestStore.clear();

      setShowLogoutDialog(false);
      router.replace("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // loading state
  if (profileLoading && !profile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // no profile state
  if (!profile) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { flexGrow: 1, justifyContent: "center", alignItems: "center" },
          ]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        >
          <AppText size="md" color={theme.colors.text.secondary}>
            {profileError ? `Không tải được profile: ${profileError}` : "Chưa có dữ liệu profile."}
          </AppText>
          <AppText size="sm" color={theme.colors.text.secondary} style={{ marginTop: 8 }}>
            Kéo xuống để thử lại.
          </AppText>
        </ScrollView>
      </View>
    );
  }

  // map profile => UI
  const userName = profile.name?.trim() || "User";
  const avatarUrl = profile.avatarURL || undefined;

  const streak = profile.currentStreak ?? 0;
  const bestStreak = profile.longestStreak ?? 0;

  const lessons = profile.stats?.lessonsDone ?? 0;
  const words = profile.stats?.wordsLearned ?? 0;
  const accuracy = useMemo(() => {
    const v = profile.stats?.accuracy;
    return typeof v === "number" ? `${v}%` : "-";
  }, [profile.stats?.accuracy]);

  const joinDate = useMemo(() => formatMemberSince(profile.memberSince ?? null), [profile.memberSince]);

  // map rankLevel => badge (tuỳ design)
  const rankLevel = profile.currentRank?.rankLevel ?? 1;
  const rankKey = rankLevel >= 10 ? "gold" : rankLevel >= 5 ? "silver" : "bronze";

  // TODO: map skin/frame nếu bạn muốn dùng activeSkin
  const frameId = "frame2" as any;

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
              <UserAvatar initials={userName.charAt(0)} size={120} imageUrl={avatarUrl} frameId={frameId}>
                <RankBadge rank={rankKey as any} />
              </UserAvatar>

              <AppText size="title" weight="bold" color={theme.colors.text.white} style={styles.userName}>
                {userName}
              </AppText>

              <AppText size="sm" color="rgba(255,255,255,0.8)" style={styles.userEmail}>
              </AppText>
            </View>
          }
        />

        <View style={styles.levelCardWrapper}>
          <HomeLevelCard
            currentXP={profile.currentXP ?? 0}
            currentRank={profile.currentRank ?? null}
            nextRank={profile.nextRank ?? null}
          />
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
              <AppText size="sm" color={theme.colors.text.secondary}>
                Overall Accuracy
              </AppText>
              <AppText size="md" weight="bold" color={theme.colors.secondary} style={styles.infoValue}>
                {accuracy}
              </AppText>
            </View>
            <Ionicons name="disc" size={theme.iconSizes.xxl} color={theme.colors.error} />
          </View>

          <View style={styles.infoCard}>
            <View style={styles.rowCenter}>
              <Ionicons name="calendar-outline" size={theme.iconSizes.lg} color={theme.colors.text.secondary} />
              <View style={styles.infoTextContainer}>
                <AppText size="xs" color={theme.colors.text.secondary}>
                  Member since
                </AppText>
                <AppText size="md" weight="bold" color={theme.colors.text.primary}>
                  {joinDate}
                </AppText>
              </View>
            </View>
          </View>

          <MenuItem icon="settings-outline" label="Settings" onPress={goSettings} />

          <TouchableOpacity style={styles.logoutButton} onPress={openLogout} disabled={isLoggingOut}>
            <Ionicons
              name="log-out-outline"
              size={theme.iconSizes.lg}
              color={theme.colors.error}
              style={styles.logoutIcon}
            />
            <AppText size="md" weight="bold" color={theme.colors.error}>
              Log Out
            </AppText>
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
        visible={showLogoutDialog}
        type="confirm"
        title="Log Out"
        message="Are you sure you want to log out?"
        isDestructive
        confirmText={isLoggingOut ? "Logging out..." : "Log Out"}
        closeText="Cancel"
        onClose={closeLogout}
        onConfirm={confirmLogOut}
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
