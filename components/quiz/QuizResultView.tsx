// src/components/game/QuizResultView.tsx
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
// ✅ Thêm StyleSheet.absoluteFillObject để làm overlay
import { ActivityIndicator, Animated, Easing, ScrollView, StyleSheet, View } from "react-native";

import theme from "../../theme";
import { AppBanner, AppButton, AppText } from "../core";
import AppDialog, { DialogType } from "../core/AppDialog";
import ResultHeader from "./core/QuizResultHeader";
import StatCard from "./core/StatCard";

import { quizApi } from "../../api/quiz";
import { useProfileStore } from "../../store/useProfileStore";

function asString(v: unknown): string {
  if (v == null) return "";
  return Array.isArray(v) ? String(v[0] ?? "") : String(v);
}

type DialogState = {
  visible: boolean;
  type: DialogType;
  title: string;
  message?: string;
  closeText?: string;
};

type XpMeta = {
  baseXP: number;
  multiplier: number;
  applied: boolean;
  source?: {
    itemId: string;
    itemName: string;
    itemImageURL?: string | null;
    effectValue: number;
  } | null;
};

type NewReward =
  | { type: "RANK"; rankName: string; rankLevel: number; inboxId: string }
  | { type: "STREAK"; name: string; dayNumber: number; inboxId: string }
  | any;

export default function QuizResultView() {
  const params = useLocalSearchParams();
  const patchFromFinish = useProfileStore((s) => s.patchFromFinish);

  const attemptId = asString((params as any).attemptId || (params as any).id);
  const courseTitle = asString((params as any).courseTitle) || "Khóa học";

  const [correctCount, setCorrectCount] = useState<number>(Number(asString((params as any).correct)) || 0);
  const [totalCount, setTotalCount] = useState<number>(() => {
    const t = Number(asString((params as any).total)) || 0;
    return t > 0 ? t : 5;
  });

  const calledRef = useRef(false);
  const [finishing, setFinishing] = useState(false);

  // ===== earned XP animation =====
  const earnedAnim = useRef(new Animated.Value(0)).current;
  const [earnedDisplay, setEarnedDisplay] = useState(0);
  const earnedTargetRef = useRef(0);

  // ===== NEW: finish meta states =====
  const [xpMeta, setXpMeta] = useState<XpMeta | null>(null);
  const [newRewards, setNewRewards] = useState<NewReward[]>([]);

  useEffect(() => {
    const id = earnedAnim.addListener(({ value }) => {
      setEarnedDisplay(Math.max(0, Math.floor(value)));
    });
    return () => earnedAnim.removeListener(id);
  }, [earnedAnim]);

  const animateEarned = (to: number) => {
    const from = earnedTargetRef.current;
    earnedTargetRef.current = to;

    const delta = Math.abs(to - from);
    const duration = Math.max(450, Math.min(1400, delta * 18));

    earnedAnim.setValue(0);

    Animated.timing(earnedAnim, {
      toValue: to,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const openDialog = (next: Omit<DialogState, "visible">) => setDialog({ ...next, visible: true });
  const closeDialog = () => setDialog((p) => ({ ...p, visible: false }));

  useEffect(() => {
    if (!attemptId) return;
    if (calledRef.current) return;
    calledRef.current = true;

    const run = async () => {
      setFinishing(true);
      try {
        const res: any = await quizApi.finish(attemptId);

        const c = Number(res?.attempt?.correctAnswers ?? 0);
        const t = Math.max(1, Number(res?.attempt?.totalQuestions ?? 1));

        setCorrectCount(c);
        setTotalCount(t);

        const earned = Math.max(0, Number(res?.attempt?.earnedXP ?? 0));
        animateEarned(earned);

        setXpMeta(res?.xpMeta ?? null);
        setNewRewards(Array.isArray(res?.newRewards) ? res.newRewards : []);

        if (res?.user) {
          patchFromFinish({
            currentXP: Number(res.user.currentXP ?? 0),
            currentStreak: Number(res.user.currentStreak ?? 0),
            longestStreak: Number(res.user.longestStreak ?? 0),
            lastStudyDate: res.user.lastStudyDate ?? null,
            currentRank: res?.rank?.currentRank
              ? {
                rankLevel: Number(res.rank.currentRank.rankLevel ?? 0),
                rankName: String(res.rank.currentRank.rankName ?? ""),
              }
              : null,
            nextRank: res?.rank?.nextRank
              ? {
                neededXP: Number(res.rank.nextRank.neededXP ?? 0),
                remainingXP: Number(res.rank.nextRank.remainingXP ?? 0),
              }
              : null,
          });
        }
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Không thể hoàn thành bài kiểm tra.";
        openDialog({
          type: "error",
          title: "Lỗi hoàn thành",
          message: msg,
          closeText: "Đồng ý",
        });
      } finally {
        setFinishing(false);
      }
    };

    run();
  }, [attemptId, patchFromFinish]);

  const accuracy = useMemo(() => {
    const safeTotal = totalCount > 0 ? totalCount : 1;
    return Math.round((correctCount / safeTotal) * 100);
  }, [correctCount, totalCount]);

  const isSuccess = accuracy >= 50;
  const title = isSuccess ? "Làm tốt lắm!" : "Cần cố gắng hơn!";
  const subtitle = isSuccess ? `${courseTitle} hoàn thành xuất sắc` : `${courseTitle} đã hoàn thành`;
  const message = isSuccess ? "Bạn đang làm rất tốt! Hãy tiếp tục bức phá." : "Đừng bỏ cuộc! Mỗi lần thử đều giúp bạn tiến bộ hơn.";

  const isFullCombo = totalCount > 0 && correctCount === totalCount;
  const rewardsArr = Array.isArray(newRewards) ? newRewards : [];
  const hasRewards = rewardsArr.length > 0;
  const xpMultiplier = Math.max(1, Number(xpMeta?.multiplier ?? 1));
  const xpBoostApplied = !!xpMeta?.applied && xpMultiplier > 1;

  const rewardSummaryText = useMemo(() => {
    if (!hasRewards) return "";
    const rankCount = rewardsArr.filter((x) => x?.type === "RANK").length;
    const streakCount = rewardsArr.filter((x) => x?.type === "STREAK").length;
    const parts: string[] = [];
    if (rankCount) parts.push(`${rankCount} Hạng`);
    if (streakCount) parts.push(`${streakCount} Chuỗi`);
    if (!parts.length) parts.push(`${rewardsArr.length} Phần thưởng`);
    return parts.join(" • ");
  }, [hasRewards, rewardsArr]);

  const xpBoostText = useMemo(() => {
    if (!xpBoostApplied) return "";
    const itemName = xpMeta?.source?.itemName;
    return itemName ? `XP Boost đang bật: x${xpMultiplier} (${itemName})` : `XP Boost đang bật: x${xpMultiplier}`;
  }, [xpBoostApplied, xpMultiplier, xpMeta]);

  return (
    // ✅ Thay đổi: Bọc ngoài bằng View flex: 1 để chứa Loading Overlay
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        // ✅ Thay đổi: Vô hiệu hóa touch/scroll khi đang finishing
        pointerEvents={finishing ? "none" : "auto"}
      >
        <ResultHeader score={correctCount} total={totalCount} title={title} subtitle={subtitle} iconSource={null} />

        {/* Bỏ loading nhỏ ở đây vì đã có overlay */}
        {/* {attemptId ? (
          <View style={styles.finishRow}>{finishing ? <ActivityIndicator size="small" color={theme.colors.primary} /> : null}</View>
        ) : null} */}

        <View style={styles.statsContainer}>
          <StatCard label="Độ chính xác" value={`${accuracy}%`} icon="radio-button-on" iconColor={theme.colors.secondary} />
          <StatCard
            label="Câu đúng"
            value={`${correctCount}/${totalCount}`}
            icon="trophy-outline"
            iconColor={theme.colors.success}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            label="XP Nhận được"
            value={`+${earnedDisplay}`}
            icon="sparkles-outline"
            iconColor={theme.colors.warning || "#D97706"}
          />
        </View>

        {isFullCombo ? (
          <AppBanner
            message={`Full Combo! Bạn trả lời đúng ${correctCount}/${totalCount}. Đã cộng thêm +50 XP thưởng.`}
            variant="success"
            icon="medal"
            containerStyle={styles.bannerMargin}
          />
        ) : null}

        {xpBoostApplied ? (
          <AppBanner message={xpBoostText} variant="info" icon="flash" containerStyle={styles.bannerMarginSmall} />
        ) : null}

        {hasRewards ? (
          <AppBanner
            message={`Bạn nhận được phần thưởng: ${rewardSummaryText}`}
            variant="success"
            icon="gift"
            containerStyle={styles.bannerMarginSmall}
          />
        ) : null}

        <AppBanner
          message={message}
          variant={isSuccess ? "success" : "info"}
          icon={isSuccess ? "star" : "fitness"}
          containerStyle={styles.bannerMarginSmall}
        />

        {xpMeta ? (
          <View style={styles.metaBox}>
            <AppText size="xs" color={theme.colors.text.secondary}>
              XP Gốc: {Math.max(0, Number(xpMeta.baseXP ?? 0))}{" "}
              {xpBoostApplied ? `• Hệ số: x${xpMultiplier} • Đã áp dụng: có` : `• Đã áp dụng: không`}
            </AppText>
          </View>
        ) : null}

        <View style={styles.actionsContainer}>
          <AppButton
            title="Xem lại đáp án"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: "/game/review" as any,
                params: {
                  attemptId,
                  courseTitle,
                  fullCombo: String(isFullCombo),
                  xpMeta: JSON.stringify(xpMeta ?? null),
                  newRewards: JSON.stringify(rewardsArr ?? []),
                },
              })
            }
            icon="eye-outline"
            style={styles.reviewBtn}
            // ✅ Thay đổi: Disable khi finishing
            disabled={!attemptId || finishing}
          />

          <AppButton
            title="Làm lại"
            variant="primary"
            onPress={() => router.navigate("/tabs/quiz" as any)}
            icon="refresh"
            style={styles.actionMargin}
            // ✅ Thay đổi: Disable khi finishing
            disabled={finishing}
          />

          <AppButton
            title="Về trang chủ"
            variant="outline"
            onPress={() => router.navigate("/tabs/quiz" as any)}
            icon="home-outline"
            style={styles.homeBtn}
            // ✅ Thay đổi: Disable khi finishing
            disabled={finishing}
          />
        </View>
      </ScrollView>

      {/* ✅ Thay đổi: Thêm Loading Overlay bao trùm toàn màn hình */}
      {finishing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText style={styles.loadingText}>Đang tổng kết...</AppText>
        </View>
      )}

      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        closeText={dialog.closeText || "Đồng ý"}
        onClose={closeDialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  bannerMargin: {
    marginTop: theme.spacing.lg,
  },
  bannerMarginSmall: {
    marginTop: theme.spacing.md,
  },
  metaBox: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionsContainer: {
    marginTop: theme.spacing.xxl,
  },
  actionMargin: {
    marginTop: theme.spacing.md,
  },
  reviewBtn: {
    borderColor: theme.colors.secondary,
    borderWidth: 1,
  },
  homeBtn: {
    marginTop: theme.spacing.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
    backgroundColor: theme.colors.background,
  },
  finishRow: {
    marginTop: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // ✅ Style mới cho Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Phủ kín màn hình
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Nền trắng mờ (hoặc tối tùy theme)
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // Đè lên mọi thứ
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text.secondary,
    fontWeight: "600",
  },
});