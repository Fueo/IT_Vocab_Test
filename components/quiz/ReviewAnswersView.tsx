import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import theme from "../../theme";
import { AppButton, AppText } from "../core";
import DetailHeader from "../core/AppDetailHeader";
import ReviewItem from "./core/ReviewItem";
import ReviewStats from "./core/ReviewStats";

import { quizApi, ReviewItem as ReviewItemDto } from "../../api/quiz";

function asString(v: unknown): string | undefined {
    if (v == null) return undefined;
    return Array.isArray(v) ? String(v[0]) : String(v);
}

const ITEMS_PER_PAGE = 5;

// ===== Helpers =====
function getTermFromReview(it: ReviewItemDto) {
    const w = it.question?.word;
    return w?.term || w?.word || w?.meaning || "Question";
}

function getCorrectAnswerText(it: ReviewItemDto) {
    // MULTIPLE_CHOICE / TRUE_FALSE: option isCorrect=true
    if (it.question.questionType !== "FILL_BLANK") {
        const correctOpt = (it.options || []).find((o) => o.isCorrect === true);
        return correctOpt?.content || "";
    }

    // FILL_BLANK: các option isCorrect=true là đáp án
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

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const currentQuestions = useMemo(() => {
        return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [items, startIndex]);

    // Map sang shape mà ReviewItem component đang dùng (theo mock cũ của bạn)
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
                explanation: it.question.explanation || "", // nếu bạn muốn: có thể dùng word.example/definition/hint tuỳ BE
                example: it.question.word?.example || "",
                userAnswer,
                _raw: it, // giữ lại nếu ReviewItem muốn dùng thêm
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

    return (
        <View style={styles.container}>
            <DetailHeader title="Review Answers" subtitle={`${correctCount} correct, ${incorrectCount} incorrect`} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
                <ReviewStats correct={correctCount} incorrect={incorrectCount} />

                <View style={styles.listContainer}>
                    {uiQuestions.map((q, index) => (
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
