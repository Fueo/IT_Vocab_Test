import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import theme from "../../theme";
import { AppBanner, AppButton } from "../core";
import AppDialog, { DialogType } from "../core/AppDialog";
import ResultHeader from "./core/QuizResultHeader";
import StatCard from "./core/StatCard";

import { quizApi } from "../../api/quiz";

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

const QuizResultView = () => {
  const params = useLocalSearchParams();

  // ✅ nhận attemptId để finish + review
  const attemptId = asString((params as any).attemptId || (params as any).id);

  // ✅ course title (optional)
  const courseTitle = asString((params as any).courseTitle) || "Course";

  // ✅ hiển thị UI ngay cả khi chưa finish xong: dùng params làm fallback
  const [correctCount, setCorrectCount] = useState<number>(Number(asString((params as any).correct)) || 0);
  const [totalCount, setTotalCount] = useState<number>(() => {
    const t = Number(asString((params as any).total)) || 0;
    return t > 0 ? t : 5;
  });

  // ===== finish state =====
  const calledRef = useRef(false);
  const [finishing, setFinishing] = useState(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const openDialog = (next: Omit<DialogState, "visible">) => setDialog({ ...next, visible: true });
  const closeDialog = () => setDialog((p) => ({ ...p, visible: false }));

  // ✅ auto finish on mount (1 lần)
  useEffect(() => {
    if (!attemptId) return;
    if (calledRef.current) return;
    calledRef.current = true;

    const run = async () => {
      setFinishing(true);
      try {
        // ✅ lấy số liệu thật từ BE để Result + Review khớp nhau
        const res = await quizApi.finish(attemptId);
        setCorrectCount(res.correctAnswers ?? 0);
        setTotalCount(res.totalQuestions ?? 1);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Không thể finish quiz.";
        openDialog({
          type: "error",
          title: "Finish thất bại",
          message: msg,
          closeText: "OK",
        });
      } finally {
        setFinishing(false);
      }
    };

    run();
  }, [attemptId]);

  // ===== Tính toán logic =====
  const accuracy = useMemo(() => {
    const safeTotal = totalCount > 0 ? totalCount : 1;
    return Math.round((correctCount / safeTotal) * 100);
  }, [correctCount, totalCount]);

  const isSuccess = accuracy >= 50;

  const title = isSuccess ? "Excellent Job!" : "Keep Practicing!";
  const subtitle = isSuccess ? `${courseTitle} completed successfully` : `${courseTitle} completed`;
  const message = isSuccess
    ? "You're doing great! Keep pushing your limits."
    : "Don't give up! Every attempt makes you better.";

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        {/* 1. Header Section */}
        <ResultHeader score={correctCount} total={totalCount} title={title} subtitle={subtitle} iconSource={null} />

        {/* ✅ Finish status (nhẹ nhàng, không phá UI) */}
        {attemptId ? (
          <View style={styles.finishRow}>{finishing ? <ActivityIndicator size="small" color={theme.colors.primary} /> : null}</View>
        ) : null}

        {/* 2. Stats Grid */}
        <View style={styles.statsContainer}>
          <StatCard label="Accuracy" value={`${accuracy}%`} icon="radio-button-on" iconColor={theme.colors.secondary} />
          <StatCard
            label="Correct"
            value={`${correctCount}/${totalCount}`}
            icon="trophy-outline"
            iconColor={theme.colors.success}
          />
        </View>

        {/* 3. Motivational Banner */}
        <AppBanner
          message={message}
          variant={isSuccess ? "success" : "info"}
          icon={isSuccess ? "star" : "fitness"}
          containerStyle={styles.bannerMargin}
        />

        {/* 4. Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppButton
            title="Review Answers"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: "/game/review" as any,
                params: {
                  attemptId,
                  courseTitle,
                },
              })
            }
            icon="eye-outline"
            style={styles.reviewBtn}
            disabled={!attemptId || finishing}
          />

          <AppButton title="Try Again" variant="primary" onPress={() => router.back()} icon="refresh" style={styles.actionMargin} />

          <AppButton
            title="Back to Home"
            variant="outline"
            onPress={() => router.navigate("/tabs/quiz" as any)}
            icon="home-outline"
            style={styles.homeBtn}
          />
        </View>
      </ScrollView>

      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        closeText={dialog.closeText || "OK"}
        onClose={closeDialog}
      />
    </>
  );
};

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
});

export default QuizResultView;
