import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageSourcePropType, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Import Themes & Core Components
import theme from '../../theme';
import { AppDialog, AppText, HomeHeader, MenuItem } from '../core';
import HomeLevelCard from '../quiz/core/HomeLevelCard';

// Import Custom Components
import RankBadge from './core/RankBadge';
import UserAvatar from './core/UserAvatar';

// ---------------------------------------------------------
// 1. CONFIG: TỪ ĐIỂN KHUNG
// ---------------------------------------------------------
const FRAME_LIBRARY: Record<string, ImageSourcePropType> = {
    'frame1': require('../../media/frames/avatar_frame1.png'),
    'frame2': require('../../media/frames/avatar_frame2.png'),
    'frame3': require('../../media/frames/avatar_frame3.png'),
    'frame4': require('../../media/frames/avatar_frame4.png'),
    'frame5': require('../../media/frames/avatar_frame5.png'),
    'frame6': require('../../media/frames/avatar_frame6.png'),
    'frame7': require('../../media/frames/avatar_frame7.png'),
};

const getFrameSource = (frameId?: string) => {
    if (!frameId) return undefined;
    return FRAME_LIBRARY[frameId];
};

// ---------------------------------------------------------
interface UserData {
    name: string;
    email: string;
    rank: string;
    equippedFrame: string;
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

// --- Component con: Stat Card ---
interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    label: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, iconColor }) => (
    <View style={styles.statCard}>
        <Ionicons
            name={icon}
            size={theme.iconSizes.lgx}
            color={iconColor}
            style={styles.statIcon}
        />
        <AppText size="lg" weight="bold" color={theme.colors.text.primary}>
            {value}
        </AppText>
        <AppText size="xs" color={theme.colors.text.secondary} style={styles.statLabel}>
            {label}
        </AppText>
    </View>
);

const ProfileView = () => {
    // 1. Khởi tạo State
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 2. State điều khiển Dialog Log Out
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleFeedbackPress = () => {
        router.push('/profile/send-feedback');
    };
    const handleSettingsPress = () => {
        router.push('/profile/setting');
    };

    // Hàm khi bấm nút Log Out -> Chỉ hiện Dialog
    const handleLogOutPress = () => {
        setShowLogoutDialog(true);
    };

    // Hàm thực sự Log Out khi người dùng chọn "Yes"
    const confirmLogOut = () => {
        setShowLogoutDialog(false);
        // Thực hiện logic xóa token/dữ liệu ở đây nếu cần
        router.replace('/auth/login');
    };

    // 3. Sử dụng useEffect để lấy dữ liệu
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 500));

                const mockData: UserData = {
                    name: "Guest User",
                    email: "guest@itvocabmaster.com",
                    rank: "gold",
                    equippedFrame: "frame2",
                    avatarUrl: "https://cdn-icons-png.freepik.com/512/6858/6858504.png",
                    stats: {
                        streak: "7",
                        bestStreak: "15",
                        lessons: "8",
                        words: "124",
                        accuracy: "85%"
                    },
                    joinDate: "December 2025"
                };

                setUserData(mockData);
            } catch (error) {
                console.error("Failed to fetch user data", error);
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

    const currentFrameSource = getFrameSource(userData.equippedFrame);

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* APP HEADER */}
                <HomeHeader
                    title="Profile"
                    rightIcon="settings-outline"
                    onRightIconPress={handleSettingsPress}
                    showRightIconBackground={false}
                    bottomContent={
                        <View style={styles.userInfoContainer}>
                            <UserAvatar
                                initials={userData.name.charAt(0)}
                                size={120}
                                imageUrl={userData.avatarUrl}
                                frameSource={currentFrameSource}
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

                {/* LEVEL CARD */}
                <View style={styles.levelCardWrapper}>
                    <HomeLevelCard />
                </View>

                {/* STATISTICS SECTION */}
                <View style={styles.contentSection}>
                    <AppText size="lg" weight="bold" color={theme.colors.text.primary} style={styles.sectionTitle}>
                        Statistics
                    </AppText>

                    <View style={styles.statsGrid}>
                        <StatCard icon="flame" value={userData.stats.streak} label="Day Streak" iconColor={theme.colors.warning || '#D97706'} />
                        <StatCard icon="trophy" value={userData.stats.bestStreak} label="Best Streak" iconColor={theme.colors.warningLight || '#F59E0B'} />
                        <StatCard icon="layers" value={userData.stats.lessons} label="Lessons Done" iconColor={theme.colors.secondary} />
                        <StatCard icon="bulb" value={userData.stats.words} label="Words Learned" iconColor={theme.colors.warningLight || '#EAB308'} />
                    </View>

                    {/* Overall Accuracy */}
                    <View style={styles.infoCard}>
                        <View>
                            <AppText size="sm" color={theme.colors.text.secondary}>Overall Accuracy</AppText>
                            <AppText size="md" weight="bold" color={theme.colors.secondary} style={styles.infoValue}>
                                {userData.stats.accuracy}
                            </AppText>
                        </View>
                        <Ionicons name="disc" size={theme.iconSizes.xxl} color={theme.colors.error} />
                    </View>

                    {/* Member Since */}
                    <View style={styles.infoCard}>
                        <View style={styles.rowCenter}>
                            <Ionicons
                                name="calendar-outline"
                                size={theme.iconSizes.lg}
                                color={theme.colors.text.secondary}
                            />
                            <View style={styles.infoTextContainer}>
                                <AppText size="xs" color={theme.colors.text.secondary}>Member since</AppText>
                                <AppText size="md" weight="bold" color={theme.colors.text.primary}>
                                    {userData.joinDate}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    <MenuItem
                        icon="settings-outline"
                        label="Settings"
                        onPress={handleSettingsPress}
                    />

                    {/* Log Out Button - Gọi hàm hiện dialog */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogOutPress}>
                        <Ionicons
                            name="log-out-outline"
                            size={theme.iconSizes.lg}
                            color={theme.colors.error}
                            style={styles.logoutIcon}
                        />
                        <AppText size="md" weight="bold" color={theme.colors.error}>Log Out</AppText>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fabContainer}
                activeOpacity={0.8}
                onPress={handleFeedbackPress}
            >
                <LinearGradient
                    colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={theme.iconSizes.lgx} color={theme.colors.text.white} />
                </LinearGradient>
            </TouchableOpacity>

            {/* 4. Dialog Log Out */}
            <AppDialog
                visible={showLogoutDialog}
                type="confirm"
                title="Log Out"
                message="Are you sure you want to log out?"
                isDestructive={true}
                confirmText="Log Out"
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={confirmLogOut}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.cardBackground,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    userInfoContainer: {
        alignItems: 'center',
        paddingBottom: theme.spacing.lg,
    },
    userName: {
        marginTop: theme.spacing.lg,
    },
    userEmail: {
        marginTop: theme.spacing.xs,
    },
    levelCardWrapper: {
        paddingHorizontal: theme.spacing.md,
        marginTop: -30,
        marginBottom: theme.spacing.lg,
        zIndex: 1,
    },
    contentSection: {
        padding: theme.spacing.md,
    },
    sectionTitle: {
        marginBottom: theme.spacing.md,
    },
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
    statIcon: {
        marginBottom: theme.spacing.sm,
    },
    statLabel: {
        marginTop: theme.spacing.xs,
    },
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
    infoValue: {
        marginTop: theme.spacing.xs,
    },
    infoTextContainer: {
        marginLeft: theme.spacing.smd,
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
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
    logoutIcon: {
        marginRight: theme.spacing.sm,
    },
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