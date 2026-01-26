// src/components/quiz/core/HomeLevelCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // ✅ Import Gradient
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";

import AppDialog, { DialogType } from "@/components/core/AppDialog";
import { guestStore } from "@/storage/guest";
import type { CurrentRankInfo, NextRankInfo } from "../../../api/profile";
import { tokenStore } from "../../../storage/token";
import theme from "../../../theme";
import { AppText } from "../../core";

type HomeLevelCardProps = {
  currentXP: number;
  currentRank: CurrentRankInfo | null;
  nextRank: NextRankInfo | null;
};

// ... giữ nguyên các hàm clamp, pickNeededXP, pickRemainingXP ...
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function pickNeededXP(nextRank: any): number {
  const v = nextRank?.neededXP ?? nextRank?.neededEXP;
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function pickRemainingXP(nextRank: any, neededXP: number, currentXP: number): number {
  const v = nextRank?.remainingXP ?? nextRank?.remainingEXP;
  const n = Number(v);
  if (Number.isFinite(n)) return Math.max(0, n);
  return Math.max(0, neededXP - currentXP);
}

const HomeLevelCard: React.FC<HomeLevelCardProps> = ({ currentXP, currentRank, nextRank }) => {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
  }>({
    visible: false,
    type: "confirm",
    title: "",
    message: "",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await tokenStore.getAccessToken();
        if (!alive) return;
        setIsAuthed(!!token);
      } catch {
        if (!alive) return;
        setIsAuthed(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const computed = useMemo(() => {
    const rankName = currentRank?.rankName ?? `Hạng ${currentRank?.rankLevel ?? 1}`;
    const safeCurrent = Math.max(0, Number(currentXP || 0));
    const neededXP = pickNeededXP(nextRank);
    const isMax = !nextRank || neededXP <= 0;
    const pct = !isMax && neededXP > 0 ? (safeCurrent / neededXP) * 100 : 100;
    const remainingXP = isMax ? 0 : pickRemainingXP(nextRank, neededXP, safeCurrent);

    return {
      rankName,
      currentXP: safeCurrent,
      targetXP: neededXP,
      progressPct: clamp(pct, 0, 100),
      remainingXP,
      isMax,
    };
  }, [currentXP, currentRank, nextRank]);

  // ===== ✅ UPDATED: Smooth Animation =====
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const to = isAuthed ? computed.progressPct : 0;

    Animated.timing(progressAnim, {
      toValue: to,
      duration: 1000, // Tăng thời gian lên 1s cho mượt
      easing: Easing.out(Easing.cubic), // ✅ Hiệu ứng chậm dần về cuối (tự nhiên hơn)
      useNativeDriver: false,
    }).start();
  }, [computed.progressPct, isAuthed]); // Chỉ chạy lại khi % thay đổi thực sự

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const closeConfirm = () => {
    setConfirmDialog((p) => ({ ...p, visible: false }));
  };

  const handleGoLogin = () => {
    setConfirmDialog({
      visible: true,
      type: "confirm",
      title: "Đăng nhập để mở khóa",
      message: "Bạn cần đăng nhập để xem Cấp độ/XP và nhận phần thưởng. Chuyển tới màn hình đăng nhập ngay?",
    });
  };

  const confirmGoLogin = () => {
    closeConfirm();
    guestStore.clear();
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace("/auth/login");
  };

  // --- Render Helpers ---

  // ✅ Component thanh Progress Bar mới với Gradient
  const renderProgressBar = () => (
    <View style={styles.progressBarBg}>
      <Animated.View style={[styles.progressBarFillWrapper, { width: progressWidth }]}>
        <LinearGradient
          // Màu Gradient vàng cam sang trọng (giống màu Rank Vàng)
          colors={["#FFD200", "#F7971E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientFill}
        />
      </Animated.View>
    </View>
  );

  if (isAuthed === null) {
    return (
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={[styles.iconCircle, styles.skeletonIcon]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText size="sm" color={theme.colors.text.primary} weight="bold">Tiến độ cấp độ</AppText>
            <AppText size="xs" color={theme.colors.text.secondary}>Đang tải...</AppText>
          </View>
        </View>
        {renderProgressBar()}
      </View>
    );
  }

  if (!isAuthed) {
    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={handleGoLogin} style={styles.levelCard}>
          <View style={styles.levelRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="lock-closed" size={20} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText size="sm" color={theme.colors.text.primary} weight="bold">Mở khóa Cấp độ</AppText>
              <AppText size="xs" color={theme.colors.text.secondary}>Đăng nhập để xem XP</AppText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <AppText size="sm" color={theme.colors.primary} weight="bold">Đăng nhập</AppText>
            </View>
          </View>

          {renderProgressBar()}

          <View style={styles.hintRow}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.secondary} />
            <AppText size="xs" color={theme.colors.text.secondary} style={{ marginLeft: 6 }}>
              Mẹo: Dữ liệu sẽ được đồng bộ khi đăng nhập.
            </AppText>
          </View>
        </TouchableOpacity>

        <AppDialog
          visible={confirmDialog.visible}
          type={confirmDialog.type}
          title={confirmDialog.title}
          message={confirmDialog.message}
          closeText="Để sau"
          confirmText="Đăng nhập"
          onClose={closeConfirm}
          onConfirm={confirmGoLogin}
          onlyConfirm={false}
        />
      </>
    );
  }

  // ✅ LOGGED IN UI
  return (
    <View style={styles.levelCard}>
      <View style={styles.levelRow}>
        {/* Icon ngôi sao có viền nhẹ */}
        <View style={styles.iconCircle}>
          <Ionicons name="star" size={20} color="white" />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <AppText size="sm" color={theme.colors.text.primary} weight="bold">
            {computed.rankName}
          </AppText>

          {computed.isMax ? (
            <AppText size="xs" color={theme.colors.text.secondary}>{computed.currentXP} XP</AppText>
          ) : (
            <AppText size="xs" color={theme.colors.text.secondary}>
              <AppText weight="bold" color={theme.colors.primary}>{computed.currentXP}</AppText> / {computed.targetXP} XP
            </AppText>
          )}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          {computed.isMax ? (
            <>
              <AppText size="lg" color={theme.colors.primary} weight="bold">MAX</AppText>
            </>
          ) : (
            <>
              <AppText size="lg" color={theme.colors.primary} weight="bold">
                +{computed.remainingXP}
              </AppText>
              <AppText size="xs" color={theme.colors.text.secondary}>để lên cấp</AppText>
            </>
          )}
        </View>
      </View>

      {renderProgressBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  levelCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    // Shadow mềm mại hơn
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16, // Thêm khoảng cách nếu cần
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16, // Tăng khoảng cách title và bar
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFC107", // Màu vàng ngôi sao
    justifyContent: "center",
    alignItems: "center",
    // Bóng cho icon
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  skeletonIcon: {
    backgroundColor: "#E5E7EB",
    elevation: 0,
    shadowOpacity: 0,
  },
  progressBarBg: {
    height: 10, // Dày hơn chút
    backgroundColor: "#F3F4F6",
    borderRadius: 5,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFillWrapper: {
    height: "100%",
    borderRadius: 5,
    overflow: 'hidden', // Bo góc cho cả gradient bên trong
  },
  gradientFill: {
    width: "100%",
    height: "100%",
  },
  hintRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HomeLevelCard;