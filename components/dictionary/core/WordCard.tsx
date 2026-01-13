import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface WordCardProps {
    id: string;
    term: string;
    phonetic: string;
    definition: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    example?: string;
    isBookmarked?: boolean;
    relatedWords?: any[];
    onBookmarkPress?: () => void;
    onPress?: () => void; // Thêm prop này để nhận hàm xử lý từ cha
}

const WordCard: React.FC<WordCardProps> = ({
    id,
    term,
    phonetic,
    definition,
    level,
    category,
    example,
    isBookmarked = false,
    onBookmarkPress,
    onPress // Destructure prop onPress
}) => {
    // Màu tag level chuẩn hóa từ hệ thống màu sắc
    const getLevelColors = () => {
        switch (level) {
            case 'beginner':
                return { bg: '#DCFCE7', text: '#15803D' };
            case 'intermediate':
                return { bg: '#FEF3C7', text: '#B45309' };
            case 'advanced':
                return { bg: '#FEE2E2', text: '#B91C1C' };
            default:
                return { bg: theme.colors.border, text: theme.colors.text.secondary };
        }
    };

    const colors = getLevelColors();

    // Hàm xử lý chuyển hướng
    const handlePress = () => {
        // 1. Nếu có hàm onPress từ bên ngoài truyền vào (VD: từ RelatedWords), ưu tiên dùng nó
        if (onPress) {
            onPress();
            return;
        }

        // 2. Nếu không, thực hiện hành động mặc định (push sang trang chi tiết)
        router.push({
            pathname: '/dictionary/[id]',
            params: {
                id,
                term,
                phonetic,
                definition,
                category,
                level,
                example: example || ""
            }
        });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Header Row: Term + Phonetic + Bookmark Icon */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <View style={styles.termWrapper}>
                        <AppText size="lg" weight="bold" color={theme.colors.text.primary}>
                            {term}
                        </AppText>
                        <AppText size="sm" color={theme.colors.text.secondary} style={styles.phonetic}>
                            {phonetic}
                        </AppText>
                    </View>
                </View>

                {/* Chặn nổi bọt sự kiện để không trigger handlePress của card */}
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        onBookmarkPress?.();
                    }}
                    activeOpacity={0.6}
                    style={styles.bookmarkButton}
                >
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color={isBookmarked ? theme.colors.primary : theme.colors.text.secondary}
                    />
                </TouchableOpacity>
            </View>

            {/* Definition - Giới hạn 2 dòng để danh sách gọn gàng */}
            <AppText
                size="md"
                color={theme.colors.text.secondary}
                numberOfLines={2}
                style={styles.definition}
            >
                {definition}
            </AppText>

            {/* Footer: Tags */}
            <View style={styles.footerRow}>
                <View style={[styles.tag, { backgroundColor: colors.bg }]}>
                    <AppText size="xs" weight="bold" color={colors.text}>
                        {level.toUpperCase()}
                    </AppText>
                </View>

                <View style={styles.categoryDot} />

                <AppText size="xs" color={theme.colors.text.secondary}>
                    {category}
                </AppText>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        // Shadow cho iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Shadow cho Android
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    termWrapper: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    phonetic: {
        marginLeft: theme.spacing.sm,
        fontStyle: 'italic',
        opacity: 0.8,
    },
    bookmarkButton: {
        padding: 4,
    },
    definition: {
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.md,
        lineHeight: 20,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tag: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: 6,
    },
    categoryDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.sm,
    }
});

export default WordCard;