import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StatusBar as RNStatusBar, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '../../../theme';
import { AppText } from '../../core';

interface CourseHeaderProps {
    title: string;
    subtitle?: string;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ title, subtitle }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.6}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>

                <View style={styles.textContainer}>
                    <AppText size="lg" weight="bold" color={theme.colors.text.primary}>
                        {title}
                    </AppText>
                    {subtitle && (
                        <AppText size="sm" color={theme.colors.text.secondary}>
                            {subtitle}
                        </AppText>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: theme.colors.background,
        // Sử dụng spacing.xxl hoặc sda tùy vào độ cao bạn muốn tránh status bar
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md, // Chỉnh lại md (16) để khớp margin tiêu chuẩn của bạn
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        marginRight: theme.spacing.md,
        padding: theme.spacing.xs, // Thay 4px bằng theme.spacing.xs
    },
    textContainer: {
        flex: 1,
    }
});

export default CourseHeader;