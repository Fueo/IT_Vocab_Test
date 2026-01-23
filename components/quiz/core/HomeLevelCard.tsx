// src/components/quiz/core/HomeLevelCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

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

  // ✅ Confirm dialog state
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

  // ✅ Check token -> xác định login hay chưa
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
    const rankName = currentRank?.rankName ?? `Rank ${currentRank?.rankLevel ?? 1}`;
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

  // ===== Animated progress =====
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const to = isAuthed ? computed.progressPct : 0;
    Animated.timing(progressAnim, {
      toValue: to,
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [computed.progressPct, progressAnim, isAuthed]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const closeConfirm = () => {
    setConfirmDialog((p) => ({ ...p, visible: false }));
  };

  const handleGoLogin = () => {
    // mở confirm trước, ok mới clear guest + navigate
    setConfirmDialog({
      visible: true,
      type: "confirm",
      title: "Đăng nhập để mở khóa",
      message: "Bạn cần đăng nhập để xem Level/XP và nhận phần thưởng. Chuyển tới màn hình đăng nhập ngay?",
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

  // ✅ Loading token -> tránh flicker
  if (isAuthed === null) {
    return (
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={20} color="white" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText size="sm" color={theme.colors.text.primary} weight="bold">
              Level Progress
            </AppText>
            <AppText size="xs" color={theme.colors.text.secondary}>
              Loading...
            </AppText>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: "0%" }]} />
        </View>
      </View>
    );
  }

  // ✅ NOT LOGGED IN UI (gợi ý đăng nhập + confirm dialog)
  if (!isAuthed) {
    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={handleGoLogin} style={styles.levelCard}>
          <View style={styles.levelRow}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="lock-closed" size={20} color="white" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText size="sm" color={theme.colors.text.primary} weight="bold">
                Unlock Level & Rewards
              </AppText>
              <AppText size="xs" color={theme.colors.text.secondary}>
                Đăng nhập để theo dõi level, XP và nhận phần thưởng.
              </AppText>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <AppText size="sm" color={theme.colors.primary} weight="bold">
                Login
              </AppText>
              <AppText size="xs" color={theme.colors.text.secondary}>
                to continue
              </AppText>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: "0%" }]} />
          </View>

          <View style={styles.hintRow}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={theme.colors.text.secondary}
            />
            <AppText size="xs" color={theme.colors.text.secondary} style={{ marginLeft: 6 }}>
              Tip: XP/Rank sẽ được lưu và đồng bộ khi bạn đăng nhập.
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
          // 2 nút Cancel + Confirm
          onlyConfirm={false}
        />
      </>
    );
  }

  // ✅ LOGGED IN UI
  return (
    <View style={styles.levelCard}>
      <View style={styles.levelRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="star" size={20} color="white" />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <AppText size="sm" color={theme.colors.text.primary} weight="bold">
            {computed.rankName}
          </AppText>

          {computed.isMax ? (
            <AppText size="xs" color={theme.colors.text.secondary}>
              {computed.currentXP} XP
            </AppText>
          ) : (
            <AppText size="xs" color={theme.colors.text.secondary}>
              {computed.currentXP} / {computed.targetXP} XP
            </AppText>
          )}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          {computed.isMax ? (
            <>
              <AppText size="lg" color={theme.colors.primary} weight="bold">
                MAX
              </AppText>
              <AppText size="xs" color={theme.colors.text.secondary}>
                level reached
              </AppText>
            </>
          ) : (
            <>
              <AppText size="lg" color={theme.colors.primary} weight="bold">
                +{computed.remainingXP}
              </AppText>
              <AppText size="xs" color={theme.colors.text.secondary}>
                to level up
              </AppText>
            </>
          )}
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  levelCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#111827",
  },
  hintRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default HomeLevelCard;
