import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface WordInfoCardProps {
    term: string;
    phonetic: string;
    category: string;
    level: string;
    onSpeak?: () => void;
}

const WordInfoCard: React.FC<WordInfoCardProps> = ({
    term,
    phonetic,
    category,
    level,
    onSpeak
}) => {
    const isIntermediate = level.toLowerCase() === 'intermediate';
    const backgroundColor = isIntermediate ? '#F59E0B' : theme.colors.primary;

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={styles.headerRow}>
                <View style={styles.textWrapper}>
                    <AppText size="huge" weight="bold" color={theme.colors.text.white}>
                        {term}
                    </AppText>
                    <AppText color="rgba(255,255,255,0.8)" style={styles.phonetic}>
                        {phonetic}
                    </AppText>
                </View>

                <TouchableOpacity
                    style={styles.speakerBtn}
                    activeOpacity={0.7}
                    onPress={onSpeak}
                >
                    <Ionicons name="volume-high" size={20} color={theme.colors.text.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.tagContainer}>
                <View style={styles.tagItem}>
                    <AppText size="xs" weight="bold" color={theme.colors.text.white}>
                        {category}
                    </AppText>
                </View>
                <View style={styles.tagItem}>
                    <AppText size="xs" weight="bold" color={theme.colors.text.white}>
                        {level}
                    </AppText>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
        borderRadius: 24,
        margin: theme.spacing.md,

        // --- SỬA SHADOW TẠI ĐÂY ---
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 }, // Đẩy bóng xuống dưới nhiều hơn
                shadowOpacity: 0.15, // Giảm độ đậm
                shadowRadius: 12, // Tăng độ nhòe để bóng "tan" ra
            },
            android: {
                elevation: 8, // Giảm elevation nếu nó quá thô
            },
        }),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textWrapper: {
        flex: 1,
    },
    phonetic: {
        marginTop: 2,
    },
    speakerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagContainer: {
        flexDirection: 'row',
        marginTop: theme.spacing.lg,
    },
    tagItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: theme.spacing.smd,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: theme.spacing.sm,
    },
});

export default WordInfoCard;