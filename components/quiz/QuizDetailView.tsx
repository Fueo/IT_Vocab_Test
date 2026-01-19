import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

import theme from "../../theme";
import { AppBanner } from "../core";
import DetailHeader from "../core/AppDetailHeader";
import ModeCard from "./core/ModeCard";

import { quizApi, QuizMode, StartAttemptBody } from "../../api/quiz";

type FromTab = "TOPIC" | "RANDOM" | undefined;

function asString(v: unknown): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

function parseCourseId(courseId: string) {
  // TOPIC: "topicId:level"
  if (courseId.includes(":") && !courseId.startsWith("random:")) {
    const [topicId, levelStr] = courseId.split(":");
    const level = Number(levelStr);
    return { kind: "TOPIC" as const, topicId, level: Number.isFinite(level) ? level : 1 };
  }

  // RANDOM: "random:10"
  if (courseId.startsWith("random:")) {
    const n = Number(courseId.split(":")[1]);
    return { kind: "RANDOM" as const, totalQuestions: Number.isFinite(n) ? n : 10 };
  }

  return { kind: "UNKNOWN" as const };
}

const QuizDetailView = () => {
  const { id, title, fromTab, totalQuestions } = useLocalSearchParams();

  const displayTitle = title ? (Array.isArray(title) ? title[0] : title) : "Course Detail";
  const courseId = id ? (Array.isArray(id) ? id[0] : id) : "default_id";

  const source: FromTab = fromTab
    ? (Array.isArray(fromTab) ? (fromTab[0] as any) : (fromTab as any))
    : undefined;

  const showLearningReview = source !== "RANDOM";
  const showRandomEndless = source !== "TOPIC";

  const parsed = useMemo(() => parseCourseId(courseId), [courseId]);

  // ✅ nếu QuizView có gửi totalQuestions riêng thì ưu tiên
  const totalQuestionsFromParam = Number(asString(totalQuestions) || "");
  const safeTotalQuestions =
    Number.isFinite(totalQuestionsFromParam) && totalQuestionsFromParam > 0
      ? totalQuestionsFromParam
      : parsed.kind === "RANDOM"
        ? parsed.totalQuestions
        : 10;

  const [starting, setStarting] = useState(false);

  const startQuiz = async (modeKey: "learning" | "review" | "random" | "endless") => {
    if (starting) return;

    let mode: QuizMode;
    if (modeKey === "learning") mode = "LEARN";
    else if (modeKey === "review") mode = "TOPIC";
    else if (modeKey === "random") mode = "RANDOM";
    else mode = "INFINITE";

    const body: StartAttemptBody = { mode };

    // TOPIC/LEARN cần topicId + level
    if (mode === "TOPIC" || mode === "LEARN") {
      if (parsed.kind !== "TOPIC" || !parsed.topicId) {
        Alert.alert("Thiếu dữ liệu", "Không xác định được topicId/level để bắt đầu quiz.");
        return;
      }
      body.topicId = parsed.topicId;
      body.level = parsed.level ?? 1;
      body.totalQuestions = 10; // bạn có thể chỉnh nếu muốn
    }

    // RANDOM cần totalQuestions
    if (mode === "RANDOM") {
      body.totalQuestions = safeTotalQuestions; // ví dụ 10
    }

    // INFINITE: BE sẽ lấy batch=10, không cần totalQuestions

    try {
      setStarting(true);
      const res = await quizApi.start(body);

      // ✅ navigate sang game: truyền attemptId + cursor
      router.replace({
        pathname: "/game/[id]",
        params: {
          id: res.attempt.attemptId, // dùng attemptId làm id route cho game là tiện nhất
          attemptId: res.attempt.attemptId,
          cursor: String(res.cursor ?? 0),
          mode: res.attempt.mode,
          topicId: res.attempt.topicId ?? "",
          level: res.attempt.level != null ? String(res.attempt.level) : "",
        },
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Start quiz thất bại.";
      Alert.alert("Không thể bắt đầu", msg);
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={styles.container}>
      <DetailHeader title={displayTitle} subtitle="Choose your learning mode" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.modesContainer}>
          {showLearningReview && (
            <ModeCard
              title="Learning Mode"
              description="Learn new words without pressure. See answers if needed."
              icon="book-outline"
              colors={["#4A90E2", "#9013FE"]}
              onPress={() => startQuiz("learning")}
            />
          )}

          {showLearningReview && (
            <ModeCard
              title="Review Mode"
              description="Smart spaced repetition. Review words you're forgetting."
              icon="sync-outline"
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              onPress={() => startQuiz("review")}
            />
          )}

          {showRandomEndless && (
            <ModeCard
              title="Random Challenge"
              description="Test yourself with random vocabulary from any lesson."
              icon="shuffle-outline"
              colors={["#FF9966", "#FF5E62"]}
              onPress={() => startQuiz("random")}
            />
          )}

          {showRandomEndless && (
            <ModeCard
              title="Endless Challenge"
              description="Endless questions. The longer you survive, the harder it gets."
              icon="infinite-outline"
              colors={["#FF3B30", "#7A0000"]}
              onPress={() => startQuiz("endless")}
            />
          )}
        </View>

        <View style={styles.bannerContainer}>
          <AppBanner
            variant="info"
            title="Tip: "
            message="Use Learning Mode for new topics, Review Mode to strengthen memory, and Random Challenge to test your overall knowledge!"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  modesContainer: { marginTop: theme.spacing.xs },
  bannerContainer: { marginTop: theme.spacing.md },
});

export default QuizDetailView;
