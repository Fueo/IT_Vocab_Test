import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

// Import từ thư mục gốc (không có src)
import theme from '../../../theme';
import { AppText } from '../../core';

const { width } = Dimensions.get('window');
// Tính toán chiều rộng card: (Màn hình - Padding trái phải - Khoảng cách giữa 2 cột) / 2
const CARD_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

interface QuizCardProps {
    title: string;
    icon: keyof typeof Ionicons.glyphMap; // Tên icon
    percentage: number;
    xp: number;
    onPress?: () => void;
    // Màu gradient nền (mặc định lấy từ theme)
    colors?: [string, string, ...string[]];
}

const QuizCard: React.FC<QuizCardProps> = ({
    title,
    icon,
    percentage,
    xp,
    onPress,
    // Mặc định dùng màu xanh lá -> xanh dương như theme
    colors = [theme.colors.gradientStart, theme.colors.gradientEnd]
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={onPress}
        >
            {/* 1. Phần nền Gradient & Icon */}
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientHeader}
            >
                {/* Icon màu trắng theo yêu cầu */}
                <Ionicons name={icon} size={48} color="white" />

                {/* 2. Badge % (Nằm đè lên ranh giới) */}
                <View style={styles.badge}>
                    <AppText size="xs" weight="bold" color={colors[0]}>
                        {percentage}%
                    </AppText>
                </View>
            </LinearGradient>

            {/* 3. Phần nội dung bên dưới */}
            <View style={styles.contentContainer}>
                {/* Tên bài học */}
                <AppText
                    size="md"
                    weight="bold"
                    color={theme.colors.text.primary}
                    centered
                    numberOfLines={2}
                    style={styles.title}
                >
                    {title}
                </AppText>

                {/* Số XP (Đã xóa dòng Words count) */}
                <View style={styles.xpRow}>
                    <Ionicons name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
                    <AppText size="xs" color={theme.colors.text.secondary} weight="medium">
                        +{xp} XP
                    </AppText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: 'white',
        borderRadius: theme.radius.lg, // Bo góc 20
        marginBottom: theme.spacing.md,
        // Hiệu ứng đổ bóng nhẹ
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'visible', // Quan trọng: Để cái badge % lồi ra ngoài được
    },
    gradientHeader: {
        height: 110, // Chiều cao phần màu
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        // Bo nhẹ 2 góc dưới của phần màu để khớp với badge tròn
        borderBottomLeftRadius: theme.radius.md,
        borderBottomRightRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 15, // Chừa khoảng trống cho badge lồi xuống
    },
    badge: {
        position: 'absolute',
        bottom: -12, // Đẩy xuống một nửa chiều cao badge
        backgroundColor: 'white',
        paddingHorizontal: theme.spacing.smd, // 12px
        paddingVertical: 4,
        borderRadius: 20,
        // Shadow riêng cho badge để nổi lên
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        minWidth: 50,
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 50,
    },
    title: {
        marginBottom: theme.spacing.xxs,
        lineHeight: 20,
    },
    xpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    }
});

export default QuizCard;