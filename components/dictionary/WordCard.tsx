import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../theme';
import { AppText } from '../core';

interface WordCardProps {
    term: string;
    phonetic: string;
    definition: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    isBookmarked?: boolean;
    onBookmarkPress?: () => void;
}

const WordCard: React.FC<WordCardProps> = ({
    term,
    phonetic,
    definition,
    level,
    category,
    isBookmarked = false,
    onBookmarkPress
}) => {
    // Màu tag level
    const getLevelColor = () => {
        if (level === 'beginner') return '#DCFCE7'; // Xanh lá nhạt
        if (level === 'intermediate') return '#FEF3C7'; // Vàng nhạt
        if (level === 'advanced') return '#FEE2E2'; // Đỏ nhạt
        return '#F3F4F6';
    };

    const getLevelTextColor = () => {
        if (level === 'beginner') return '#15803D';
        if (level === 'intermediate') return '#B45309';
        if (level === 'advanced') return '#B91C1C';
        return theme.colors.text.secondary;
    };

    return (
        <View style={styles.container}>
            {/* Header Row: Term + Phonetic + Bookmark Icon */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <AppText size="lg" weight="bold" color={theme.colors.text.primary}>
                            {term}
                        </AppText>
                        <AppText size="sm" color={theme.colors.text.secondary} style={{ marginLeft: 8, fontStyle: 'italic' }}>
                            {phonetic}
                        </AppText>
                    </View>
                </View>

                <TouchableOpacity onPress={onBookmarkPress} activeOpacity={0.6}>
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={isBookmarked ? theme.colors.primary : theme.colors.text.secondary}
                    />
                </TouchableOpacity>
            </View>

            {/* Definition */}
            <AppText size="md" color={theme.colors.text.secondary} style={{ marginTop: 4, marginBottom: 12 }}>
                {definition}
            </AppText>

            {/* Footer: Tags */}
            <View style={styles.footerRow}>
                {/* Level Tag */}
                <View style={[styles.tag, { backgroundColor: getLevelColor() }]}>
                    <AppText size="xs" weight="bold" color={getLevelTextColor()}>
                        {level}
                    </AppText>
                </View>

                {/* Category Text */}
                <AppText size="xs" color={theme.colors.text.secondary} style={{ marginLeft: 12 }}>
                    {category}
                </AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    }
});

export default WordCard;