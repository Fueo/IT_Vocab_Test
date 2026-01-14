import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '../../theme';
import { AppDialog, AppText, HomeHeader, MenuItem } from '../core';
import HomeLevelCard from '../quiz/core/HomeLevelCard';

import RankBadge from './core/RankBadge';
import UserAvatar from './core/UserAvatar';

interface UserData {
    name: string;
    email: string;
    rank: string;
    equippedFrame: string; // "frame1" | "frame2" ...
    avatarUrl: string;
    stats: {
        streak: string;
        bestStreak: string;
        lessons: string;
        words: string;
        accuracy: string;
    };
    joinDate: string;
}

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    label: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, iconColor }) => (
    <View style={styles.statCard}>
        <Ionicons name={icon} size={theme.iconSizes.lgx} color={iconColor} style={styles.statIcon} />
        <AppText size="lg" weight="bold" color={theme.colors.text.primary}>
            {value}
        </AppText>
        <AppText size="xs" color={theme.colors.text.secondary} style={styles.statLabel}>
            {label}
        </AppText>
    </View>
);

const MOCK_USER: UserData = {
    name: 'Guest User',
    email: 'guest@itvocabmaster.com',
    rank: 'gold',
    equippedFrame: 'frame2',
    avatarUrl: 'https://cdn-icons-png.freepik.com/512/6858/6858504.png',
    stats: {
        streak: '7',
        bestStreak: '15',
        lessons: '8',
        words: '124',
        accuracy: '85%',
    },
    joinDate: 'December 2025',
};

const ProfileView = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const goFeedback = () => router.push('/profile/send-feedback');
    const goSettings = () => router.push('/profile/setting');

    const openLogout = () => setShowLogoutDialog(true);
    const closeLogout = () => setShowLogoutDialog(false);

    const confirmLogOut = () => {
        closeLogout();
        router.replace('/auth/login');
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                await new Promise((r) => setTimeout(r, 500));
                setUserData(MOCK_USER);
            } catch (e) {
                console.error('Failed to fetch user data', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (isLoading || !userData) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <HomeHeader
                    title="Profile"
                    rightIcon="settings-outline"
                    onRightIconPress={goSettings}
                    showRightIconBackground={false}
                    bottomContent={
                        <View style={styles.userInfoContainer}>
                            <UserAvatar
                                initials={userData.name.charAt(0)}
                                size={120}
                                imageUrl={userData.avatarUrl}
                                frameId={userData.equippedFrame as any} // nếu bạn đã type FrameId ở UserAvatar thì cast sang FrameId cho chuẩn
                            >
                                <RankBadge rank={userData.rank as any} />
                            </UserAvatar>

                            <AppText size="title" weight="bold" color={theme.colors.text.white} style={styles.userName}>
                                {userData.name}
                            </AppText>
                            <AppText size="sm" color="rgba(255,255,255,0.8)" style={styles.userEmail}>
                                {userData.email}
                            </AppText>
                        </View>
                    }
                />

                <View style={styles.levelCardWrapper}>
                    <HomeLevelCard />
                </View>

                <View style={styles.contentSection}>
                    <AppText size="lg" weight="bold" color={theme.colors.text.primary} style={styles.sectionTitle}>
                        Statistics
                    </AppText>

                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="flame"
                            value={userData.stats.streak}
                            label="Day Streak"
                            iconColor={theme.colors.warning || '#D97706'}
                        />
                        <StatCard
                            icon="trophy"
                            value={userData.stats.bestStreak}
                            label="Best Streak"
                            iconColor={theme.colors.warningLight || '#F59E0B'}
                        />
                        <StatCard
                            icon="layers"
                            value={userData.stats.lessons}
                            label="Lessons Done"
                            iconColor={theme.colors.secondary}
                        />
                        <StatCard
                            icon="bulb"
                            value={userData.stats.words}
                            label="Words Learned"
                            iconColor={theme.colors.warningLight || '#EAB308'}
                        />
                    </View>

                    <View style={styles.infoCard}>
                        <View>
                            <AppText size="sm" color={theme.colors.text.secondary}>
                                Overall Accuracy
                            </AppText>
                            <AppText size="md" weight="bold" color={theme.colors.secondary} style={styles.infoValue}>
                                {userData.stats.accuracy}
                            </AppText>
                        </View>
                        <Ionicons name="disc" size={theme.iconSizes.xxl} color={theme.colors.error} />
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.rowCenter}>
                            <Ionicons name="calendar-outline" size={theme.iconSizes.lg} color={theme.colors.text.secondary} />
                            <View style={styles.infoTextContainer}>
                                <AppText size="xs" color={theme.colors.text.secondary}>
                                    Member since
                                </AppText>
                                <AppText size="md" weight="bold" color={theme.colors.text.primary}>
                                    {userData.joinDate}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    <MenuItem icon="settings-outline" label="Settings" onPress={goSettings} />

                    <TouchableOpacity style={styles.logoutButton} onPress={openLogout}>
                        <Ionicons
                            name="log-out-outline"
                            size={theme.iconSizes.lg}
                            color={theme.colors.error}
                            style={styles.logoutIcon}
                        />
                        <AppText size="md" weight="bold" color={theme.colors.error}>
                            Log Out
                        </AppText>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fabContainer} activeOpacity={0.8} onPress={goFeedback}>
                <LinearGradient
                    colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={theme.iconSizes.lgx}
                        color={theme.colors.text.white}
                    />
                </LinearGradient>
            </TouchableOpacity>

            <AppDialog
                visible={showLogoutDialog}
                type="confirm"
                title="Log Out"
                message="Are you sure you want to log out?"
                isDestructive
                confirmText="Log Out"
                onClose={closeLogout}
                onConfirm={confirmLogOut}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.cardBackground },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },

    scrollContent: { paddingBottom: 100 },

    userInfoContainer: { alignItems: 'center', paddingBottom: theme.spacing.lg },
    userName: { marginTop: theme.spacing.lg },
    userEmail: { marginTop: theme.spacing.xs },

    levelCardWrapper: {
        paddingHorizontal: theme.spacing.md,
        marginTop: -30,
        marginBottom: theme.spacing.lg,
        zIndex: 1,
    },

    contentSection: { padding: theme.spacing.md },
    sectionTitle: { marginBottom: theme.spacing.md },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    statCard: {
        width: '48%',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statIcon: { marginBottom: theme.spacing.sm },
    statLabel: { marginTop: theme.spacing.xs },

    infoCard: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoValue: { marginTop: theme.spacing.xs },
    infoTextContainer: { marginLeft: theme.spacing.smd },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },

    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: '#FEF2F2',
    },
    logoutIcon: { marginRight: theme.spacing.sm },

    fabContainer: {
        position: 'absolute',
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProfileView;
