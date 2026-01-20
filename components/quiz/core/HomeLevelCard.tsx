// src/components/quiz/core/HomeLevelCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import type { NextRankInfo, RankInfo } from "../../../api/profile";
import theme from "../../../theme";
import { AppText } from "../../core";

type HomeLevelCardProps = {
  currentXP: number;             // ✅ XP trong rank hiện tại
  currentRank: RankInfo | null;
  nextRank: NextRankInfo | null; // ✅ ngưỡng XP để lên rank tiếp theo (neededEXP)
};


const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const HomeLevelCard: React.FC<HomeLevelCardProps> = ({ currentXP, currentRank, nextRank }) => {
const computed = useMemo(() => {
  const rankName = currentRank?.rankName ?? `Rank ${currentRank?.rankLevel ?? 1}`;

  // ✅ ngưỡng để lên rank tiếp theo
  const targetXP = nextRank?.neededEXP ? Number(nextRank.neededEXP) : 0;

  const safeCurrent = Math.max(0, Number(currentXP || 0));

  const pct = targetXP > 0 ? (safeCurrent / targetXP) * 100 : 100; // nếu max rank -> full

  const remainingEXP =
    nextRank?.remainingEXP != null
      ? Math.max(0, Number(nextRank.remainingEXP))
      : Math.max(0, targetXP - safeCurrent);

  return {
    rankName,
    currentXP: safeCurrent,
    targetXP,
    progressPct: clamp(pct, 0, 100),
    remainingEXP,
    isMax: !nextRank || targetXP <= 0,
  };
}, [currentXP, currentRank, nextRank]);

  // ===== Animated progress (mượt, không nhảy cái "rụp") =====
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: computed.progressPct,
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [computed.progressPct, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

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
                +{computed.remainingEXP}
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
});

export default HomeLevelCard;
