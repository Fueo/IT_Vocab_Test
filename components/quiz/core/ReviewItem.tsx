import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface ReviewItemProps {
    index: number;
    question: any;
    userAnswer: string | null;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ index, question, userAnswer }) => {
    const isCorrect = userAnswer === question.correctAnswer;

    return (
        <View style={styles.container}>
            {/* Header: Question Number & Status */}
            <View style={styles.header}>
                {/* ✅ Dịch: Question -> Câu hỏi */}
                <AppText size="sm" weight="bold" color={theme.colors.text.secondary}>
                    Câu hỏi {index + 1}
                </AppText>
                <View style={styles.statusRow}>
                    <Ionicons
                        name={isCorrect ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={isCorrect ? theme.colors.success : theme.colors.error}
                    />
                    {/* ✅ Dịch: Correct/Incorrect -> Đúng/Sai */}
                    <AppText
                        size="xs"
                        weight="bold"
                        color={isCorrect ? theme.colors.success : theme.colors.error}
                        style={{ marginLeft: 4 }}
                    >
                        {isCorrect ? "Đúng" : "Sai"}
                    </AppText>
                </View>
            </View>

            {/* Term & Question */}
            <AppText size="lg" weight="bold" color={theme.colors.text.primary} style={{ marginBottom: 4 }}>
                {question.term}
            </AppText>
            <AppText size="md" color={theme.colors.text.secondary} style={{ marginBottom: 12 }}>
                {question.question}
            </AppText>

            {/* Your Answer Section */}
            <View style={[
                styles.box,
                isCorrect ? styles.correctBox : styles.incorrectBox
            ]}>
                {/* ✅ Dịch: Your Answer -> Câu trả lời của bạn */}
                <AppText size="xs" weight="bold" color={isCorrect ? "#15803D" : "#B91C1C"} style={{ marginBottom: 2 }}>
                    Câu trả lời của bạn:
                </AppText>
                <AppText size="sm" color={theme.colors.text.primary}>
                    {/* ✅ Dịch: No answer selected -> Chưa chọn đáp án */}
                    {userAnswer || "Chưa chọn đáp án"}
                </AppText>
            </View>

            {/* Correct Answer Section (Chỉ hiện nếu sai) */}
            {!isCorrect && (
                <View style={[styles.box, styles.correctBox]}>
                    {/* ✅ Dịch: Correct Answer -> Đáp án đúng */}
                    <AppText size="xs" weight="bold" color="#15803D" style={{ marginBottom: 2 }}>
                        Đáp án đúng:
                    </AppText>
                    <AppText size="sm" color={theme.colors.text.primary}>
                        {question.correctAnswer}
                    </AppText>
                </View>
            )}

            {/* Explanation Section */}
            <View style={[styles.box, styles.explanationBox]}>
                {/* ✅ Dịch: Explanation -> Giải thích */}
                <AppText size="xs" weight="bold" color="#1E40AF" style={{ marginBottom: 2 }}>
                    Giải thích:
                </AppText>
                <AppText size="sm" color={theme.colors.text.primary}>
                    {question.explanation}
                </AppText>
            </View>

            {/* Example Section */}
            {question.example && (
                <View style={[styles.box, styles.exampleBox]}>
                    {/* ✅ Dịch: Example -> Ví dụ */}
                    <AppText size="xs" weight="bold" color="#7E22CE" style={{ marginBottom: 2 }}>
                        Ví dụ:
                    </AppText>
                    <AppText size="sm" color={theme.colors.text.primary} style={{ fontStyle: 'italic' }}>
                        {question.example}
                    </AppText>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    box: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    correctBox: {
        backgroundColor: '#DCFCE7',
        borderColor: '#86EFAC',
    },
    incorrectBox: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FCA5A5',
    },
    explanationBox: {
        backgroundColor: '#EFF6FF', // Xanh dương nhạt
        borderColor: '#BFDBFE',
    },
    exampleBox: {
        backgroundColor: '#F3E8FF', // Tím nhạt
        borderColor: '#D8B4FE',
    }
});

export default ReviewItem;