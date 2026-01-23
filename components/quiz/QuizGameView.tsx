// src/components/quiz/QuizGameView.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // Dùng hook gốc để có dispatch
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import theme from "../../theme";
import { AppBanner, AppButton, AppText } from "../core";
import AppDialog, { DialogType } from "../core/AppDialog";
import AnswerButton from "./core/AnswerButton";
import FeedbackBottom from "./core/FeedbackBottom";
import QuizHeader from "./core/QuizHeader";

import { QuestionDto, quizApi, QuizMode } from "../../api/quiz";

function asString(v: unknown): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

type Status = "playing" | "checked";

/**
 * ✅ Không cho nhập tiếng Việt (dấu), không khoảng trắng.
 * Chỉ giữ a-z A-Z 0-9 (ASCII).
 */
function sanitizeFillInput(raw: string) {
  return String(raw || "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * ✅ FILL_BLANK API: chỉ có 1 option đúng, option.content chính là đáp án.
 * => số ô nhập = length của option.content sau khi sanitize.
 */
function calcFillLenFromAnswerOption(question: QuestionDto | null) {
  if (!question) return 6;

  const answerRaw = question.options?.[0]?.content ?? "";
  const answer = sanitizeFillInput(answerRaw);

  const fallback = sanitizeFillInput(
    question.word?.term || question.word?.word || (question.word as any)?.meaning || ""
  );

  const len = answer.length || fallback.length || 6;
  return Math.max(1, len);
}

/**
 * Fill-blank input kiểu OTP (_____) giống VerifyCodeView
 * - length = đáp án (options[0].content)
 * - chỉ nhận ASCII
 */
const FillBlankCellsInput = ({
  value,
  onChange,
  length,
  editable,
  autoFocus,
  checked,
  isCorrect,
}: {
  value: string;
  onChange: (t: string) => void;
  length: number;
  editable: boolean;
  autoFocus?: boolean;
  checked: boolean;
  isCorrect: boolean;
}) => {
  const inputRef = useRef<TextInput>(null);
  const cursorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blinking = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    blinking.start();
    return () => blinking.stop();
  }, [cursorOpacity]);

  const normalized = useMemo(() => sanitizeFillInput(value).slice(0, length), [value, length]);

  const borderColorWhenChecked = checked ? (isCorrect ? "#22C55E" : "#EF4444") : undefined;

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < length; i++) {
      const ch = normalized[i];
      const isFocused = i === normalized.length;

      cells.push(
        <View
          key={i}
          style={[
            styles.cell,
            editable && isFocused ? styles.cellFocused : null,
            ch ? styles.cellFilled : null,
            checked && styles.cellChecked,
            checked && borderColorWhenChecked ? { borderColor: borderColorWhenChecked } : null,
          ]}
        >
          {ch ? (
            <AppText size="sm" weight="bold" color={theme.colors.text.primary}>
              {ch}
            </AppText>
          ) : (
            editable && isFocused && <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
          )}
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={{ marginTop: theme.spacing.sm }}>
      <Pressable
        style={styles.cellContainer}
        onPress={() => editable && inputRef.current?.focus()}
        accessibilityRole="button"
      >
        {renderCells()}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={normalized}
        editable={editable}
        autoFocus={autoFocus}
        keyboardType={Platform.OS === "ios" ? "ascii-capable" : "default"}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => onChange(sanitizeFillInput(text).slice(0, length))}
        style={styles.hiddenInput}
        caretHidden
        maxLength={length}
      />
    </View>
  );
};

type DialogState = {
  visible: boolean;
  type: DialogType;
  title: string;
  message?: string;
  closeText?: string;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm?: (() => void) | undefined;
};

const QuizGameView = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const attemptId = asString(params.attemptId) || asString(params.id) || "";
  const initialCursor = Number(asString(params.cursor) || "0");
  const modeParam = (asString(params.mode) as QuizMode | string | undefined) || undefined;
  const endlessParam = asString(params.endless);

  const isLearningMode = modeParam === "LEARN" || modeParam === "learning";
  const isEndlessMode = endlessParam === "1" || endlessParam === "true" || modeParam === "INFINITE";

  // ===== quiz state =====
  const [cursor, setCursor] = useState<number>(Number.isFinite(initialCursor) ? initialCursor : 0);
  const [total, setTotal] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [pendingNext, setPendingNext] = useState<null | { cursor: number; question: QuestionDto }>(null);

  // answer UI state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [fillText, setFillText] = useState<string>("");
  const [status, setStatus] = useState<Status>("playing");
  const [showHint, setShowHint] = useState(false);

  // feedback from submit
  const [lastIsCorrect, setLastIsCorrect] = useState<boolean>(false);
  const [lastExplanation, setLastExplanation] = useState<string>("");

  // cache correct answers map for "See Answer" (LEARN)
  const [correctMap, setCorrectMap] = useState<Map<string, { correctOptionId?: string; correctAnswers?: string[] }>>(
    new Map()
  );

  // ===== ABANDON & EXIT LOGIC =====
  const [abandoning, setAbandoning] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  // ✅ Refs quan trọng để chặn/nhả điều hướng
  const pendingActionRef = useRef<any>(null); // Lưu hành động back/home/...
  const shouldAllowLeaveRef = useRef(false); // Cờ cho phép thoát

  const openDialog = useCallback(
    (next: Omit<DialogState, "visible">) => setDialog({ ...next, visible: true }),
    []
  );
  const closeDialog = useCallback(() => setDialog((p) => ({ ...p, visible: false, onConfirm: undefined })), []);

  /**
   * Hàm xử lý khi user xác nhận "Thoát & Hủy"
   */
  const handleAbandonAndExit = async () => {
    if (abandoning) return;
    setAbandoning(true);

    try {
      if (attemptId) {
        await quizApi.abandon(attemptId);
      }

      // ✅ Mở cổng cho phép thoát
      shouldAllowLeaveRef.current = true;
      closeDialog();

      // ✅ Thực thi lại hành động đã bị chặn trước đó
      if (pendingActionRef.current) {
        navigation.dispatch(pendingActionRef.current);
      } else {
        router.back(); // Fallback an toàn
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Không thể hủy quiz.";
      closeDialog();
      openDialog({
        type: "error",
        title: "Hủy quiz thất bại",
        message: msg,
        closeText: "Về trang chủ",
        onConfirm: () => {
          // Nếu lỗi quá nặng, cho phép force exit luôn
          shouldAllowLeaveRef.current = true;
          router.replace("/tabs/quiz");
        },
      });
    } finally {
      setAbandoning(false);
    }
  };

  // ✅ CHẶN ĐIỀU HƯỚNG MẶC ĐỊNH
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      // 1. Nếu cờ cho phép đã bật, không chặn nữa -> để router xử lý (quay về màn trước)
      if (shouldAllowLeaveRef.current) {
        return;
      }

      // 2. Chặn điều hướng
      e.preventDefault();

      // 3. Lưu lại hành động người dùng muốn làm (Back, Replace, Home...)
      pendingActionRef.current = e.data.action;

      // 4. Nếu dialog chưa hiện thì hiện lên
      if (!dialog.visible && !abandoning) {
        openDialog({
          type: "confirm",
          title: "Thoát quiz?",
          message: "Tiến trình hiện tại sẽ bị hủy.",
          closeText: "Ở lại",
          confirmText: "Thoát & Hủy",
          isDestructive: true,
          onConfirm: handleAbandonAndExit, // Gọi hàm xử lý trên
        });
      }
    });

    return unsub;
  }, [navigation, dialog.visible, abandoning, attemptId]); // eslint-disable-line react-hooks/exhaustive-deps

  const termText = useMemo(() => {
    if (!question) return "";
    return "Question";
  }, [question]);

  const promptText = useMemo(() => (question ? question.content : ""), [question]);

  const hintText = useMemo(() => {
    if (!question) return "";

    const h = String((question as any)?.hint || "").trim();
    if (h) return h;

    const ex = (question as any)?.word?.example;
    const def = (question as any)?.word?.definition || (question as any)?.word?.meaning;
    return String(ex || def || "").trim();
  }, [question]);

  const fillLen = useMemo(() => calcFillLenFromAnswerOption(question), [question]);

  const fetchQuestion = async (atId: string, c: number) => {
    setLoading(true);
    try {
      const res = await quizApi.getQuestionByCursor(atId, c);

      if ((res as any)?.question == null) {
        const msg = (res as any)?.message || "Không lấy được câu hỏi.";
        throw new Error(msg);
      }

      const ok = res as any;
      setTotal(ok.attempt?.totalQuestions ?? 0);
      setQuestion(ok.question);
      setCursor(ok.cursor ?? c);

      // reset answer UI
      setSelectedOptionId(null);
      setFillText("");
      setStatus("playing");
      setPendingNext(null);
      setShowHint(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!attemptId) return;
    fetchQuestion(attemptId, cursor).catch((e) => {
      console.log("fetchQuestion error:", e?.message || e);
      // Nếu lỗi ngay khi load, cho phép thoát luôn
      shouldAllowLeaveRef.current = true;
      router.replace("/(tabs)" as any);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const buildExplanation = (
    q: QuestionDto,
    isCorrect: boolean,
    correctOptionId?: string | null,
    correctAnswers?: string[] | null
  ) => {
    if (isCorrect) return "Correct! 🎉";

    if (q.questionType === "FILL_BLANK") {
      const ans = (correctAnswers || []).filter(Boolean);
      if (ans.length) return `Correct answer: ${ans.join(" / ")}`;
      return "Incorrect.";
    }

    if (correctOptionId) {
      const opt = q.options.find((o) => String(o._id) === String(correctOptionId));
      if (opt?.content) return `Correct answer: ${opt.content}`;
    }

    return "Incorrect.";
  };

  const handleCheck = async () => {
    if (!question || !attemptId) return;

    if (
      (question.questionType === "MULTIPLE_CHOICE" || question.questionType === "TRUE_FALSE") &&
      !selectedOptionId
    )
      return;
    if (question.questionType === "FILL_BLANK" && !sanitizeFillInput(fillText).trim()) return;

    setLoading(true);
    try {
      const res = await quizApi.submitAndNext(attemptId, {
        cursor,
        attemptAnswerId: (question as any).attemptAnswer?._id,
        selectedOptionId: question.questionType === "FILL_BLANK" ? undefined : selectedOptionId || undefined,
        answerText: question.questionType === "FILL_BLANK" ? sanitizeFillInput(fillText) : undefined,
      });

      const isCorrect = !!res.current?.result?.isCorrect;
      if (isCorrect) setCorrectCount((p) => p + 1);

      setLastIsCorrect(isCorrect);
      setLastExplanation(
        buildExplanation(
          question,
          isCorrect,
          res.current?.result?.correctOptionId ?? null,
          res.current?.result?.correctAnswers ?? null
        )
      );

      setTotal(res.attempt?.totalQuestions ?? total);
      setPendingNext(res.next ? { cursor: res.next.cursor, question: res.next.question } : null);
      setStatus("checked");
    } catch (e: any) {
      openDialog({
        type: "error",
        title: "Lỗi",
        message: e?.response?.data?.message || e?.message || "Không thể gửi đáp án.",
        closeText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAnswer = async () => {
    if (!question || !attemptId) return;

    setLoading(true);
    try {
      let cm = correctMap;
      const qid = String((question as any).questionId);

      if (!cm.has(qid)) {
        const review = await quizApi.review(attemptId);
        const nextMap = new Map<string, { correctOptionId?: string; correctAnswers?: string[] }>();

        for (const it of review.items || []) {
          const qqid = String(it.question.questionId);
          const correctOpt = (it.options || []).find((o) => o.isCorrect === true);
          const correctAnswers = (it.options || []).filter((o) => o.isCorrect === true).map((o) => o.content);

          nextMap.set(qqid, {
            correctOptionId: correctOpt?._id,
            correctAnswers: correctAnswers?.length ? correctAnswers : undefined,
          });
        }

        cm = nextMap;
        setCorrectMap(nextMap);
      }

      const info = cm.get(qid);

      if (question.questionType === "FILL_BLANK") {
        const correctTextRaw = (
          info?.correctAnswers?.[0] ||
          question.options?.[0]?.content ||
          ""
        ).toString();
        const correctText = sanitizeFillInput(correctTextRaw);
        if (!correctText) return;

        setFillText(correctText.slice(0, fillLen));

        const res = await quizApi.submitAndNext(attemptId, {
          cursor,
          attemptAnswerId: (question as any).attemptAnswer?._id,
          answerText: correctText,
        });

        const isCorrect = !!res.current?.result?.isCorrect;
        if (isCorrect) setCorrectCount((p) => p + 1);

        setLastIsCorrect(isCorrect);
        setLastExplanation(
          buildExplanation(
            question,
            isCorrect,
            res.current?.result?.correctOptionId ?? null,
            res.current?.result?.correctAnswers ?? null
          )
        );

        setTotal(res.attempt?.totalQuestions ?? total);
        setPendingNext(res.next ? { cursor: res.next.cursor, question: res.next.question } : null);
        setStatus("checked");
        return;
      }

      const correctOptId =
        info?.correctOptionId || (question.options?.[0]?._id ? String(question.options[0]._id) : undefined);
      if (!correctOptId) return;

      setSelectedOptionId(String(correctOptId));

      const res = await quizApi.submitAndNext(attemptId, {
        cursor,
        attemptAnswerId: (question as any).attemptAnswer?._id,
        selectedOptionId: String(correctOptId),
      });

      const isCorrect = !!res.current?.result?.isCorrect;
      if (isCorrect) setCorrectCount((p) => p + 1);

      setLastIsCorrect(isCorrect);
      setLastExplanation(
        buildExplanation(
          question,
          isCorrect,
          res.current?.result?.correctOptionId ?? null,
          res.current?.result?.correctAnswers ?? null
        )
      );

      setTotal(res.attempt?.totalQuestions ?? total);
      setPendingNext(res.next ? { cursor: res.next.cursor, question: res.next.question } : null);
      setStatus("checked");
    } catch (e: any) {
      openDialog({
        type: "error",
        title: "Lỗi",
        message: e?.response?.data?.message || e?.message || "Không thể lấy đáp án.",
        closeText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (pendingNext) {
      setQuestion(pendingNext.question);
      setCursor(pendingNext.cursor);

      setSelectedOptionId(null);
      setFillText("");
      setStatus("playing");
      setPendingNext(null);
      setShowHint(false);
      return;
    }

    // Kết thúc game thành công -> cũng cho phép thoát
    shouldAllowLeaveRef.current = true;
    router.replace({
      pathname: "/game/result",
      params: {
        attemptId,
        correct: String(correctCount),
        total: String(total || cursor + 1),
        courseTitle: asString(params.title) || "Quiz",
      },
    });
  };

  if (!attemptId) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <AppText color={theme.colors.text.secondary}>Missing attemptId</AppText>
      </View>
    );
  }

  if (loading && !question) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <AppText color={theme.colors.text.secondary}>No question</AppText>
        {/* Lỗi thì cho thoát luôn */}
        <AppButton
          title="Back"
          onPress={() => {
            shouldAllowLeaveRef.current = true;
            router.back();
          }}
          variant="outline"
          style={{ marginTop: theme.spacing.md }}
        />
      </View>
    );
  }

  const currentIndexForHeader = cursor;
  const isLastQuestion = !pendingNext;

  return (
    <View style={styles.container}>
      {/* ✅ FIX: Chỉ gọi router.back(), beforeRemove sẽ tự chặn */}
      <QuizHeader
        current={currentIndexForHeader}
        total={total || 1}
        endless={isEndlessMode}
        onClose={() => router.back()}
      />

      <View style={styles.gameContent}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.questionHeaderRow}>
            <AppText size="xs" color={theme.colors.text.secondary} style={styles.label}>
              LEARN THIS WORD
            </AppText>

            {isLearningMode && !!hintText && (
              <TouchableOpacity
                onPress={() => setShowHint(!showHint)}
                style={styles.hintToggle}
                activeOpacity={0.6}
              >
                <Ionicons
                  name={showHint ? "eye-off-outline" : "bulb-outline"}
                  size={18}
                  color={theme.colors.secondary}
                />
                <AppText size="sm" weight="bold" color={theme.colors.secondary} style={styles.hintText}>
                  {showHint ? "Hide Hint" : "Hint"}
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.questionBox}>
            <View style={styles.termRow}>
              <View style={styles.speakerIcon}>
                <Ionicons name="volume-high" size={20} color={theme.colors.primary} />
              </View>
              <AppText size="xl" weight="bold" color={theme.colors.text.primary}>
                {termText}
              </AppText>
            </View>

            <AppText size="md" color={theme.colors.text.secondary}>
              {promptText}
            </AppText>
          </View>

          {showHint && !!hintText && (
            <AppBanner
              variant="info"
              icon="bulb"
              title="Hint: "
              message={hintText}
              containerStyle={styles.hintBanner}
            />
          )}

          {(question.questionType === "MULTIPLE_CHOICE" || question.questionType === "TRUE_FALSE") && (
            <View style={styles.optionsContainer}>
              {question.options.map((opt) => {
                let btnState: "default" | "selected" | "correct" | "wrong" | "disabled" = "default";

                if (status === "playing") {
                  btnState = selectedOptionId === String(opt._id) ? "selected" : "default";
                } else {
                  if (selectedOptionId === String(opt._id)) btnState = lastIsCorrect ? "correct" : "wrong";
                  else btnState = "disabled";
                }

                return (
                  <AnswerButton
                    key={String(opt._id)}
                    text={opt.content}
                    state={btnState}
                    onPress={() => status === "playing" && setSelectedOptionId(String(opt._id))}
                  />
                );
              })}
            </View>
          )}

          {question.questionType === "FILL_BLANK" && (
            <View style={{ marginTop: theme.spacing.sm }}>
              <AppText size="sm" color={theme.colors.text.secondary} style={{ marginBottom: theme.spacing.sm }}>
                Type your answer (A-Z, 0-9 only):
              </AppText>

              <FillBlankCellsInput
                value={fillText}
                onChange={setFillText}
                length={fillLen}
                editable={status === "playing"}
                autoFocus
                checked={status === "checked"}
                isCorrect={lastIsCorrect}
              />

              {status === "checked" && (
                <AppText
                  size="sm"
                  weight="bold"
                  color={lastIsCorrect ? "#22C55E" : "#EF4444"}
                  style={{ marginTop: theme.spacing.md }}
                >
                  {lastExplanation}
                </AppText>
              )}
            </View>
          )}
        </ScrollView>

        {status === "playing" ? (
          <View style={styles.footer}>
            <View style={styles.buttonRow}>
              {isLearningMode && (
                <AppButton
                  title="See Answer"
                  onPress={handleSeeAnswer}
                  variant="outline"
                  style={styles.halfButton}
                  disabled={loading}
                  isLoading={loading}
                />
              )}

              <AppButton
                title="Check Answer"
                onPress={handleCheck}
                variant="primary"
                disabled={
                  loading ||
                  (question.questionType === "FILL_BLANK"
                    ? !sanitizeFillInput(fillText).trim()
                    : (question.questionType === "MULTIPLE_CHOICE" ||
                      question.questionType === "TRUE_FALSE") &&
                    !selectedOptionId)
                }
                style={isLearningMode ? styles.halfButton : styles.fullButton}
                isLoading={loading}
              />
            </View>
          </View>
        ) : (
          <FeedbackBottom
            isCorrect={lastIsCorrect}
            explanation={lastExplanation}
            onContinue={handleContinue}
            isLastQuestion={isLastQuestion}
          />
        )}
      </View>

      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => {
          if (abandoning) return;
          closeDialog();
          // Nếu user bấm "Ở lại" hoặc tắt dialog, reset action để lần sau chặn lại từ đầu
          pendingActionRef.current = null;
        }}
        onConfirm={dialog.type === "confirm" ? dialog.onConfirm : undefined}
        closeText={dialog.closeText}
        confirmText={dialog.confirmText}
        isDestructive={dialog.isDestructive}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gameContent: { flex: 1, position: "relative" },
  scrollContent: { padding: theme.spacing.md, paddingBottom: 150 },

  questionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    minHeight: 30,
  },
  label: { textTransform: "uppercase", flex: 1 },
  hintToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xxs,
    paddingLeft: theme.spacing.sm,
  },
  hintText: { marginLeft: theme.spacing.xs },

  questionBox: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  termRow: { flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm },
  speakerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.smd,
    elevation: 1,
  },

  hintBanner: { marginBottom: theme.spacing.lg },
  optionsContainer: { marginTop: theme.spacing.sm },

  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  halfButton: { flex: 1 },
  fullButton: { width: "100%" },

  // ===== FillBlankCellsInput styles =====
  cellContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    gap: 10,
  },
  cell: {
    width: 42,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cellFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.03 }],
  },
  cellFilled: { borderColor: theme.colors.text.primary, backgroundColor: "#F9FAFB" },
  cellChecked: { borderWidth: 2 },
  cursor: { width: 2, height: 24, backgroundColor: theme.colors.primary, borderRadius: 1 },
  hiddenInput: { position: "absolute", width: "100%", height: "100%", opacity: 0 },
});

export default QuizGameView;