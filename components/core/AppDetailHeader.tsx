import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StatusBar as RNStatusBar, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '../../theme';
import AppText from './AppText';

interface CourseHeaderProps {
    title: string;
    subtitle?: string;
    // 👇 UPDATE: Thêm prop này để nhận component bên phải
    rightContent?: React.ReactNode;
}

const DetailHeader: React.FC<CourseHeaderProps> = ({ title, subtitle, rightContent }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* 1. Back Button (Left) */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.6}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>

                {/* 2. Text Content (Center - Flex 1) */}
                <View style={styles.textContainer}>
                    <AppText size="lg" weight="bold" color={theme.colors.text.primary} numberOfLines={1}>
                        {title}
                    </AppText>
                    {subtitle && (
                        <AppText size="sm" color={theme.colors.text.secondary} numberOfLines={1}>
                            {subtitle}
                        </AppText>
                    )}
                </View>

                {/* 3. Right Content (Right) */}
                {/* Nếu có truyền rightContent thì hiển thị */}
                {rightContent && (
                    <View style={styles.rightContainer}>
                        {rightContent}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        marginRight: theme.spacing.md,
        padding: theme.spacing.xs,
    },
    textContainer: {
        flex: 1, // Chiếm hết khoảng trống ở giữa -> Đẩy rightContent sang phải
        justifyContent: 'center',
    },
    // 👇 Style cho nút bên phải
    rightContainer: {
        marginLeft: theme.spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default DetailHeader;