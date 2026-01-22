import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../theme';
import AppText from './AppText';

interface PaginationControlProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const PaginationControl: React.FC<PaginationControlProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
}) => {

    const handlePrev = () => {
        if (currentPage > 1 && !isLoading) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && !isLoading) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <View style={styles.container}>
            {/* Nút Prev */}
            <TouchableOpacity
                onPress={handlePrev}
                disabled={currentPage === 1 || isLoading}
                style={[
                    styles.button,
                    (currentPage === 1 || isLoading) && styles.disabledButton
                ]}
            >
                <Ionicons
                    name="chevron-back"
                    size={20}
                    color={currentPage === 1 ? theme.colors.text.secondary : theme.colors.text.primary}
                />
                <AppText
                    size="sm"
                    color={currentPage === 1 ? theme.colors.text.secondary : theme.colors.text.primary}
                >
                    Prev
                </AppText>
            </TouchableOpacity>

            {/* Text hiển thị số trang */}
            <View style={styles.pageInfo}>
                <AppText size="sm" color={theme.colors.text.secondary}>
                    Page <AppText weight="bold" color={theme.colors.primary}>{currentPage}</AppText> of {totalPages}
                </AppText>
            </View>

            {/* Nút Next */}
            <TouchableOpacity
                onPress={handleNext}
                disabled={currentPage === totalPages || isLoading}
                style={[
                    styles.button,
                    (currentPage === totalPages || isLoading) && styles.disabledButton
                ]}
            >
                <AppText
                    size="sm"
                    color={currentPage === totalPages ? theme.colors.text.secondary : theme.colors.text.primary}
                >
                    Next
                </AppText>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentPage === totalPages ? theme.colors.text.secondary : theme.colors.text.primary}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: 'transparent',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        // Shadow nhẹ
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        elevation: 0,
    },
    pageInfo: {
        alignItems: 'center',
    }
});

export default PaginationControl;