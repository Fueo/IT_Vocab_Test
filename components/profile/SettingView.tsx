import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

// Import các component
import { Href, router } from 'expo-router';
import theme from '../../theme';
import AppHeader from '../core/AppDetailHeader';
import AppText from '../core/AppText';
import MenuItem from '../core/MenuItem'; // Import MenuItem đã nâng cấp

const SettingView = () => {
    const [isPushEnabled, setIsPushEnabled] = useState(true);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const togglePush = () => setIsPushEnabled(prev => !prev);
    const toggleSound = () => setIsSoundEnabled(prev => !prev);
    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    const handleNavigation = (screenName: string) => {
        router.push(`/profile/${screenName}` as Href);
    };

    // Component Section Container
    const SectionContainer: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
        <View style={styles.sectionWrapper}>
            {title && (
                <AppText size="sm" weight="bold" color={theme.colors.text.secondary} style={styles.sectionTitle}>
                    {title.toUpperCase()}
                </AppText>
            )}
            <View style={styles.cardContainer}>
                {children}
            </View>
        </View>
    );

    // Component Toggle (Giữ nguyên vì logic Switch khác với MenuItem)
    const ToggleItem = ({ icon, title, subtitle, value, onToggle, showDivider = true }: any) => (
        <>
            <View style={styles.toggleItemContainer}>
                <View style={styles.leftContent}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={icon} size={20} color={theme.colors.text.primary} />
                    </View>
                    <View style={styles.textWrapper}>
                        <AppText size="md" weight="bold" color={theme.colors.text.primary}>
                            {title}
                        </AppText>
                        <AppText size="xs" color={theme.colors.text.secondary} style={{ marginTop: 2 }}>
                            {subtitle}
                        </AppText>
                    </View>
                </View>
                <Switch
                    trackColor={{ false: "#E5E7EB", true: theme.colors.success }}
                    thumbColor={"white"}
                    ios_backgroundColor="#E5E7EB"
                    onValueChange={onToggle}
                    value={value}
                />
            </View>
            {showDivider && <View style={styles.divider} />}
        </>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Settings" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* --- SECTION 1: PREFERENCES --- */}
                <SectionContainer title="Preferences">
                    <ToggleItem
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Get reminders to practice"
                        value={isPushEnabled}
                        onToggle={togglePush}
                    />
                    <ToggleItem
                        icon="volume-high-outline"
                        title="Sound Effects"
                        subtitle="Play sounds for answers"
                        value={isSoundEnabled}
                        onToggle={toggleSound}
                    />
                    <ToggleItem
                        icon="moon-outline"
                        title="Dark Mode"
                        subtitle="Switch to dark theme"
                        value={isDarkMode}
                        onToggle={toggleDarkMode}
                        showDivider={false}
                    />
                </SectionContainer>

                {/* --- SECTION 2: ACCOUNT --- */}
                <SectionContainer title="Account">
                    <MenuItem
                        icon="person-outline"
                        label="Edit Profile"
                        subtitle="Update name, email, avatar"
                        onPress={() => handleNavigation('edit')}
                        showBorder={false} // Tắt viền ngoài để nằm trong card
                        showDivider={true} // Hiện đường kẻ dưới
                    />
                    <MenuItem
                        icon="lock-closed-outline"
                        label="Change Password"
                        subtitle="Update your security"
                        onPress={() => handleNavigation('changepassword')}
                        showBorder={false}
                        showDivider={false} // Mục cuối không cần đường kẻ
                    />
                </SectionContainer>

                {/* --- SECTION 3: SUPPORT --- */}
                <SectionContainer title="Support">
                    <MenuItem
                        icon="chatbox-ellipses-outline"
                        label="Feedback"
                        subtitle="Share your thoughts & bug reports"
                        onPress={() => router.replace('/feedback/homepage')} // Điều hướng đến trang FeedbackView
                        showBorder={false}
                        showDivider={true}
                    />

                    <MenuItem
                        icon="help-circle-outline"
                        label="Help Center"
                        subtitle="Get answers to your questions"
                        // onPress={() => handleNavigation('HelpCenter')}
                        showBorder={false}
                        showDivider={true}
                    />
                    <MenuItem
                        icon="document-text-outline"
                        label="Terms of Service"
                        subtitle="Read our terms"
                        // onPress={() => handleNavigation('Terms')}
                        showBorder={false}
                        showDivider={true}
                    />
                    <MenuItem
                        icon="mail-outline"
                        label="Contact Us"
                        subtitle="support@itvocabtest.com"
                        // onPress={() => handleNavigation('Contact')}
                        showBorder={false}
                        showDivider={false}
                    />
                </SectionContainer>

                {/* --- FOOTER --- */}
                <View style={styles.footer}>
                    <AppText size="sm" color={theme.colors.text.secondary} centered>
                        IT Vocab Test
                    </AppText>
                    <AppText size="xs" color={theme.colors.text.secondary} centered style={{ marginBottom: 4 }}>
                        Version 1.0.0
                    </AppText>
                    <AppText size="xs" color={theme.colors.text.secondary} centered>
                        Made with ❤️ by Npm Run Dev team.
                    </AppText>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: theme.spacing.md,
        paddingBottom: 40,
    },
    sectionWrapper: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        marginLeft: theme.spacing.xs,
        marginBottom: theme.spacing.sm,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: theme.radius.lg,
        paddingVertical: theme.spacing.xs,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    // Style riêng cho Toggle (Vì MenuItem đã tách style riêng)
    toggleItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.smd,
        paddingHorizontal: theme.spacing.md,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    textWrapper: {
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 68,
    },
    footer: {
        marginTop: theme.spacing.md,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
});

export default SettingView;