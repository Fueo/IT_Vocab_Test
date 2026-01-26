import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import theme from "../../theme";
import { AppBanner } from "../core";
import DetailHeader from "../core/AppDetailHeader";
import ModeCard from "./core/ModeCard";

import { quizApi, QuizMode, StartAttemptBody } from "../../api/quiz";

// ✅ Import AppDialog
import AppDialog, { DialogType } from "../core/AppDialog";

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

  const displayTitle = title ? (Array.isArray(title) ? title[0] : title) : "Chi tiết khóa học";
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

  // ✅ giữ lại body lần bấm gần nhất để retry sau khi abandon
  const [pendingStartBody, setPendingStartBody] = useState<StartAttemptBody | null>(null);

  // ===== ✅ DIALOG STATE (mở rộng để confirm/cancel) =====
  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
    closeText?: string;
    confirmText?: string;
    isDestructive?: boolean;
    onlyConfirm?: boolean;
    disableBackdropClose?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    type: "error",
    title: "",
    message: "",
  });

  const handleCloseDialog = () => {
    setDialogConfig((prev) => ({
      ...prev,
      visible: false,
      onConfirm: undefined,
      onCancel: undefined,
      disableBackdropClose: false,
    }));
  };

  const goToGame = (attempt: any, cursor?: number) => {
    const attemptId = String(attempt?.attemptId || attempt?._id || "");
    router.replace({
      pathname: "/game/[id]",
      params: {
        id: attemptId,
        attemptId,
        cursor: String(cursor ?? 0),
        mode: String(attempt?.mode ?? ""),
        topicId: String(attempt?.topicId ?? ""),
        level: attempt?.level != null ? String(attempt.level) : "",
      },
    });
  };

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
        setDialogConfig({
          visible: true,
          type: "warning",
          title: "Thiếu dữ liệu",
          message: "Không xác định được chủ đề hoặc cấp độ để bắt đầu bài học.",
          confirmText: "Đóng",
          onlyConfirm: true,
        });
        return;
      }
      body.topicId = parsed.topicId;
      body.level = parsed.level ?? 1;
      body.totalQuestions = 10;
    }

    // RANDOM cần totalQuestions
    if (mode === "RANDOM") {
      body.totalQuestions = safeTotalQuestions;
    }

    // ✅ lưu lại để có thể start lại sau khi abandon
    setPendingStartBody(body);

    try {
      setStarting(true);
      const res = await quizApi.start(body);
      goToGame(res.attempt, res.cursor);
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;

      // ✅ CASE: đang có quiz IN_PROGRESS (BE trả 409 + inProgressAttempt)
      if (status === 409 && data?.inProgressAttempt) {
        const inProgress = data.inProgressAttempt;
        const inProgressAttemptId = String(inProgress?._id || inProgress?.attemptId || "");

        setDialogConfig({
          visible: true,
          type: "confirm",
          title: "Bạn đang làm dở 1 bài kiểm tra",
          message:
            data?.message ||
            "Bạn đang có một bài kiểm tra đang làm dở. Bạn muốn hủy bài hiện tại hay làm tiếp?",
          closeText: "Hủy bài",
          confirmText: "Làm tiếp",
          disableBackdropClose: true, // không cho bấm nền đóng
          isDestructive: true, // màu confirm type sẽ theo error/primary (tùy theme)

          // ✅ Làm tiếp
          onConfirm: () => {
            handleCloseDialog();
            // cursor không có từ BE -> default 0 (game screen thường tự load lại theo attempt)
            goToGame(
              {
                attemptId: inProgressAttemptId,
                mode: inProgress?.mode,
                topicId: inProgress?.topicId,
                level: inProgress?.level,
              },
              0
            );
          },

          // ✅ Hủy quiz rồi start quiz mới (theo body vừa bấm)
          onCancel: async () => {
            try {
              handleCloseDialog();
              setStarting(true);

              if (inProgressAttemptId) {
                await quizApi.abandon(inProgressAttemptId);
              }

              const nextBody = pendingStartBody || body;
              const res2 = await quizApi.start(nextBody);
              goToGame(res2.attempt, res2.cursor);
            } catch (err: any) {
              const msg =
                err?.userMessage ||
                err?.response?.data?.message ||
                err?.message ||
                "Không thể hủy bài kiểm tra hiện tại. Vui lòng thử lại.";

              setDialogConfig({
                visible: true,
                type: "error",
                title: "Rất tiếc!",
                message: msg,
                confirmText: "Đóng",
                onlyConfirm: true,
              });
            } finally {
              setStarting(false);
            }
          },
        });

        return;
      }

      // ✅ fallback: lỗi bình thường
      const msg =
        e?.userMessage ||
        e?.response?.data?.message ||
        e?.message ||
        "Không thể bắt đầu bài kiểm tra.";

      setDialogConfig({
        visible: true,
        type: "error",
        title: "Rất tiếc!",
        message: msg,
        confirmText: "Đóng",
        onlyConfirm: true,
      });
    } finally {
      setStarting(false);
    }
  };

  return (
    <View style={styles.container}>
      <DetailHeader title={displayTitle} subtitle="Chọn chế độ học" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.modesContainer}>
          {showLearningReview && (
            <ModeCard
              title="Chế Độ Học"
              description="Học từ mới không áp lực. Xem đáp án nếu cần."
              icon="book-outline"
              colors={["#4A90E2", "#9013FE"]}
              onPress={() => startQuiz("learning")}
            />
          )}

          {showLearningReview && (
            <ModeCard
              title="Chế Độ Ôn Tập"
              description="Ôn tập thông minh. Ôn lại những từ bạn sắp quên."
              icon="sync-outline"
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              onPress={() => startQuiz("review")}
            />
          )}

          {showRandomEndless && (
            <ModeCard
              title="Thử Thách Ngẫu Nhiên"
              description="Kiểm tra bản thân với từ vựng ngẫu nhiên từ bất kỳ bài học nào."
              icon="shuffle-outline"
              colors={["#FF9966", "#FF5E62"]}
              onPress={() => startQuiz("random")}
            />
          )}

          {showRandomEndless && (
            <ModeCard
              title="Thử Thách Vô Tận"
              description="Câu hỏi vô tận. Càng sống sót lâu, càng khó."
              icon="infinite-outline"
              colors={["#FF3B30", "#7A0000"]}
              onPress={() => startQuiz("endless")}
            />
          )}
        </View>

        <View style={styles.bannerContainer}>
          <AppBanner
            variant="info"
            title="Mẹo: "
            message="Sử dụng Chế Độ Học cho chủ đề mới, Chế Độ Ôn Tập để củng cố trí nhớ, và Thử Thách Ngẫu Nhiên để kiểm tra kiến thức tổng quát!"
          />
        </View>
      </ScrollView>

      {/* ✅ Render Dialog (đã hỗ trợ confirm/cancel + disable backdrop close) */}
      <AppDialog
        visible={dialogConfig.visible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={handleCloseDialog}
        onConfirm={dialogConfig.onConfirm}
        onCancel={dialogConfig.onCancel}
        closeText={dialogConfig.closeText}
        confirmText={dialogConfig.confirmText}
        isDestructive={dialogConfig.isDestructive}
        onlyConfirm={dialogConfig.onlyConfirm}
        disableBackdropClose={dialogConfig.disableBackdropClose}
      />
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