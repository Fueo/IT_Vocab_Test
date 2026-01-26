import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import { AppButton, AppText } from '../../core';

interface FeedbackBottomProps {
    isCorrect: boolean;
    explanation?: string;
    onContinue: () => void;
    // [MỚI] Thêm prop này để biết là câu cuối
    isLastQuestion?: boolean;
}

const FeedbackBottom: React.FC<FeedbackBottomProps> = ({
    isCorrect,
    explanation,
    onContinue,
    // Mặc định là false nếu không truyền
    isLastQuestion = false
}) => {
    const bgColor = isCorrect ? '#dcfce7' : '#fee2e2'; // Xanh nhạt / Đỏ nhạt
    const titleColor = isCorrect ? theme.colors.success : theme.colors.error;

    // ✅ Dịch tiêu đề phản hồi
    const titleText = isCorrect ? 'Tuyệt vời!' : 'Chưa chính xác';
    const iconName = isCorrect ? 'checkmark-circle' : 'close-circle';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.headerRow}>
                <Ionicons name={iconName} size={28} color={titleColor} />
                <AppText size="lg" weight="bold" color={titleColor} style={{ marginLeft: 8 }}>
                    {titleText}
                </AppText>
            </View>

            {explanation && (
                <AppText size="sm" color={theme.colors.text.primary} style={{ marginBottom: 20 }}>
                    {explanation}
                </AppText>
            )}

            <AppButton
                // [CẬP NHẬT] Đổi text nút dựa trên isLastQuestion
                // ✅ Dịch nút bấm
                title={isLastQuestion ? "Hoàn thành" : "Tiếp tục"}
                onPress={onContinue}
                variant="primary"
                style={styles.btn}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    btn: {
        width: '100%',
    }
});

export default FeedbackBottom;