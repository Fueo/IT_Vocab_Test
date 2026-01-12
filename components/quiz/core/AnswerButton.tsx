import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

type AnswerState = 'default' | 'selected' | 'correct' | 'wrong' | 'disabled';

interface AnswerButtonProps {
    text: string;
    state: AnswerState;
    onPress: () => void;
}

const AnswerButton: React.FC<AnswerButtonProps> = ({ text, state, onPress }) => {
    // Cấu hình màu sắc dựa trên state
    let backgroundColor = 'white';
    let borderColor = theme.colors.border;
    let textColor = theme.colors.text.primary;
    let borderWidth = 2; // Viền dày hơn chút cho đẹp

    if (state === 'selected') {
        backgroundColor = '#EBF8FF'; // Xanh dương nhạt
        borderColor = '#4299E1';     // Xanh dương đậm
        textColor = '#2B6CB0';
    } else if (state === 'correct') {
        backgroundColor = theme.colors.success; // Xanh lá
        borderColor = theme.colors.success;
        textColor = 'white';
    } else if (state === 'wrong') {
        backgroundColor = theme.colors.error;   // Đỏ
        borderColor = theme.colors.error;
        textColor = 'white';
    } else if (state === 'disabled') {
        backgroundColor = '#F9FAFB';
        borderColor = '#F3F4F6';
        textColor = '#D1D5DB';
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={state === 'correct' || state === 'wrong' || state === 'disabled'}
            activeOpacity={0.8}
            style={[
                styles.container,
                { backgroundColor, borderColor, borderWidth }
            ]}
        >
            <AppText size="md" weight="medium" color={textColor} style={{ flex: 1 }}>
                {text}
            </AppText>

            {/* Icon check hoặc x nếu đúng/sai */}
            {state === 'correct' && <Ionicons name="checkmark-circle" size={24} color="white" />}
            {state === 'wrong' && <Ionicons name="close-circle" size={24} color="white" />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: 16,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'space-between',
        // Shadow nhẹ
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
});

export default AnswerButton;