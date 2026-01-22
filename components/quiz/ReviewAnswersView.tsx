import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import theme from "../../theme";
import { AppBanner, AppButton, AppText } from "../core";
import DetailHeader from "../core/AppDetailHeader";
import ReviewItem from "./core/ReviewItem";
import ReviewStats from "./core/ReviewStats";

import { quizApi, ReviewItem as ReviewItemDto } from "../../api/quiz";

function asString(v: unknown): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

function safeJsonParse<T>(v: unknown, fallback: T): T {
  try {
    if (v == null) return fallback;
    if (typeof v === "string") return (JSON.parse(v) as T) ?? fallback;
    return (v as T) ?? fallback;
  } catch {
    return fallback;
  }
}

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

const ITEMS_PER_PAGE = 5;

// ===== Helpers =====
function getTermFromReview(it: ReviewItemDto) {
  const w = it.question?.word;
  return w?.term || w?.word || w?.meaning || "Question";
}

function getCorrectAnswerText(it: ReviewItemDto) {
  if (it.question.questionType !== "FILL_BLANK") {
    const correctOpt = (it.options || []).find((o) => o.isCorrect === true);
    return correctOpt?.content || "";
  }

  const ans = (it.options || []).filter((o) => o.isCorrect === true).map((o) => o.content);
  return ans[0] || "";
}

function getUserAnswerText(it: ReviewItemDto) {
  if (!it.userAnswer) return "";

  if (it.question.questionType === "FILL_BLANK") {
    return it.userAnswer.answerText || "";
  }

  const pickedId = it.userAnswer.selectedOptionId;
  const pickedOpt = (it.options || []).find((o) => String(o._id) === String(pickedId));
  return pickedOpt?.content || "";
}

export default function ReviewAnswersView() {
  const params = useLocalSearchParams();

  const attemptId = asString(params.attemptId) || asString(params.id) || "";

  // ✅ meta passed from Result screen
  const fullComboParam = asString((params as any).fullCombo);
  const fullComboPassed = fullComboParam === "true" || fullComboParam === "1";

  const xpMeta = useMemo(() => {
    return safeJsonParse<XpMeta | null>((params as any).xpMeta, null);
  }, [params]);

  const newRewards = useMemo(() => {
    const arr = safeJsonParse<NewReward[]>((params as any).newRewards, []);
    return Array.isArray(arr) ? arr : [];
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ReviewItemDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!attemptId) return;

    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await quizApi.review(attemptId);
        if (!mounted) return;

        setItems(res.items || []);
        setCurrentPage(1);
      } catch (e: any) {
        console.log("review fetch error:", e?.response?.data?.message || e?.message || e);
        router.back();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [attemptId]);

  const totalItems = items.length;

  const correctCount = useMemo(() => {
    return items.filter((it) => it.userAnswer?.isCorrect === true).length;
  }, [items]);

  const incorrectCount = totalItems - correctCount;

  // ✅ full combo: ưu tiên param (vì màn result đã tính), fallback tự tính nếu param không có
  const isFullCombo = useMemo(() => {
    if (fullComboParam != null) return fullComboPassed;
    return totalItems > 0 && correctCount === totalItems;
  }, [fullComboParam, fullComboPassed, totalItems, correctCount]);

  // ✅ xp boost
  const xpMultiplier = Math.max(1, Number(xpMeta?.multiplier ?? 1));
  const xpBoostApplied = !!xpMeta?.applied && xpMultiplier > 1;

  // ✅ rewards
  const hasRewards = newRewards.length > 0;

  const rewardSummaryText = useMemo(() => {
    if (!hasRewards) return "";

    const rankCount = newRewards.filter((x) => x?.type === "RANK").length;
    const streakCount = newRewards.filter((x) => x?.type === "STREAK").length;

    const parts: string[] = [];
    if (rankCount) parts.push(`${rankCount} Rank`);
    if (streakCount) parts.push(`${streakCount} Streak`);
    if (!parts.length) parts.push(`${newRewards.length} Reward`);

    return parts.join(" • ");
  }, [hasRewards, newRewards]);

  const xpBoostText = useMemo(() => {
    if (!xpBoostApplied) return "";
    const itemName = xpMeta?.source?.itemName;
    return itemName ? `XP Boost đang active: x${xpMultiplier} (${itemName})` : `XP Boost đang active: x${xpMultiplier}`;
  }, [xpBoostApplied, xpMultiplier, xpMeta]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentQuestions = useMemo(() => {
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [items, startIndex]);

  const uiQuestions = useMemo(() => {
    return currentQuestions.map((it, idx) => {
      const term = getTermFromReview(it);
      const correctAnswer = getCorrectAnswerText(it);
      const userAnswer = getUserAnswerText(it);

      return {
        id: String(it.question.questionId),
        term,
        question: it.question.content,
        correctAnswer,
        explanation: it.question.explanation || "",
        example: it.question.word?.example || "",
        userAnswer,
        _raw: it,
        index: startIndex + idx,
      };
    });
  }, [currentQuestions, startIndex]);

  if (!attemptId) {
    return (
      <View style={[styles.container, styles.center]}>
        <AppText color={theme.colors.text.secondary}>Missing attemptId</AppText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // subtitle gọn gàng + gắn tag nếu có
  const subtitleParts = [`${correctCount} correct, ${incorrectCount} incorrect`];
  if (isFullCombo) subtitleParts.push("Full Combo");
  if (xpBoostApplied) subtitleParts.push(`x${xpMultiplier} XP`);
  if (hasRewards) subtitleParts.push("Rewards");

  return (
    <View style={styles.container}>
      <DetailHeader title="Review Answers" subtitle={subtitleParts.join(" • ")} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        {/* ✅ meta banners */}
        {isFullCombo ? (
          <AppBanner
            message={`Full Combo! Bạn đã trả lời đúng ${correctCount}/${totalItems}. Bonus +50 XP đã được tính.`}
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

        <ReviewStats correct={correctCount} incorrect={incorrectCount} />

        <View style={styles.listContainer}>
          {uiQuestions.map((q) => (
            <ReviewItem key={q.id} index={q.index} question={q} userAnswer={q.userAnswer} />
          ))}
        </View>

        {totalPages > 1 && (
          <View style={styles.paginationWrapper}>
            <AppButton
              title="Prev"
              variant="outline"
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              icon="chevron-back"
              style={StyleSheet.flatten([styles.pageBtn, { width: "auto" }])}
            />

            <View style={styles.pageIndicator}>
              <AppText size="sm" weight="bold" color={theme.colors.text.secondary}>
                {currentPage} / {totalPages}
              </AppText>
            </View>

            <AppButton
              title="Next"
              variant="outline"
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              icon="chevron-forward"
              iconRight={true}
              style={StyleSheet.flatten([styles.pageBtn, { width: "auto" }])}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: theme.spacing.md },

  bannerMargin: { marginBottom: theme.spacing.md },
  bannerMarginSmall: { marginBottom: theme.spacing.sm },

  listContainer: { marginTop: theme.spacing.md },

  paginationWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  pageBtn: {
    flex: 0.38,
    height: 42,
    marginBottom: 0,
    paddingVertical: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  pageIndicator: { flex: 0.24, alignItems: "center", justifyContent: "center" },
  bottomSpacer: { height: theme.spacing.xxl },

  center: { justifyContent: "center", alignItems: "center" },
});
