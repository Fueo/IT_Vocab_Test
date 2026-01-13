import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface DetailSectionProps {
    title: string;
    content: string;
    icon?: keyof typeof Ionicons.glyphMap;
    rightComponent?: React.ReactNode;
    backgroundColor?: string;
}

const DetailSection: React.FC<DetailSectionProps> = ({
    title,
    content,
    rightComponent,
    backgroundColor
}) => {
    // Xác định style container động để ghi đè màu nền nếu có props truyền vào
    const containerStyle = [
        styles.container,
        backgroundColor ? { backgroundColor, borderColor: 'transparent' } : null
    ];

    return (
        <View style={containerStyle}>
            <View style={styles.header}>
                <View style={styles.titleWrapper}>
                    <AppText
                        size="xs"
                        weight="bold"
                        color={theme.colors.text.secondary}
                        style={styles.title}
                    >
                        {title.toUpperCase()}
                    </AppText>
                </View>
                {rightComponent}
            </View>

            <AppText
                color={theme.colors.text.primary}
                style={styles.content}
            >
                {content}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
        borderRadius: 20, // Bo tròn theo thiết kế mới
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        // Đổ bóng nhẹ nhàng, tự nhiên
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        letterSpacing: 1.2,
    },
    content: {
        lineHeight: 24,
        fontSize: 15,
        // Đảm bảo chữ không bị quá sát lề khi nền có màu
    }
});

export default DetailSection;