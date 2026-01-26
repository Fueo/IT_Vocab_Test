import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

// Import các component
import { Href, router } from 'expo-router';
import theme from '../../theme';
import AppHeader from '../core/AppDetailHeader';
import AppText from '../core/AppText';
import MenuItem from '../core/MenuItem'; // Import MenuItem đã nâng cấp

// ✅ Import Store
import { useProfileStore } from '../../store/useProfileStore';

const SettingView = () => {
    const [isPushEnabled, setIsPushEnabled] = useState(true);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // ✅ Lấy profile từ store
    const profile = useProfileStore((s) => s.profile);
    const isLoggedIn = !!profile; // Biến check trạng thái đăng nhập

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
            <AppHeader title="Cài Đặt" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* --- SECTION 1: PREFERENCES --- */}
                <SectionContainer title="Tùy chọn">
                    <ToggleItem
                        icon="notifications-outline"
                        title="Thông báo"
                        subtitle="Nhận nhắc nhở luyện tập"
                        value={isPushEnabled}
                        onToggle={togglePush}
                    />
                    <ToggleItem
                        icon="volume-high-outline"
                        title="Hiệu ứng âm thanh"
                        subtitle="Phát âm thanh khi trả lời"
                        value={isSoundEnabled}
                        onToggle={toggleSound}
                    />
                    <ToggleItem
                        icon="moon-outline"
                        title="Giao diện tối"
                        subtitle="Chuyển sang giao diện tối"
                        value={isDarkMode}
                        onToggle={toggleDarkMode}
                        showDivider={false}
                    />
                </SectionContainer>

                {/* ✅ SECTION 2: ACCOUNT - Chỉ hiện khi ĐÃ ĐĂNG NHẬP */}
                {isLoggedIn && (
                    <SectionContainer title="Tài khoản">
                        <MenuItem
                            icon="person-outline"
                            label="Chỉnh sửa hồ sơ"
                            subtitle="Cập nhật tên, SĐT, ảnh đại diện"
                            onPress={() => handleNavigation('edit')}
                            showBorder={false}
                            showDivider={true}
                        />
                        <MenuItem
                            icon="lock-closed-outline"
                            label="Đổi mật khẩu"
                            subtitle="Cập nhật bảo mật"
                            onPress={() => handleNavigation('changepassword')}
                            showBorder={false}
                            showDivider={false}
                        />
                    </SectionContainer>
                )}

                {/* --- SECTION 3: SUPPORT --- */}
                <SectionContainer title="Hỗ trợ">
                    {/* ✅ FEEDBACK - Chỉ hiện khi ĐÃ ĐĂNG NHẬP */}
                    {isLoggedIn && (
                        <MenuItem
                            icon="chatbox-ellipses-outline"
                            label="Phản hồi"
                            subtitle="Chia sẻ ý kiến & báo lỗi"
                            onPress={() => router.replace('/feedback/homepage')}
                            showBorder={false}
                            showDivider={true}
                        />
                    )}

                    <MenuItem
                        icon="help-circle-outline"
                        label="Trung tâm trợ giúp"
                        subtitle="Giải đáp thắc mắc của bạn"
                        // onPress={() => handleNavigation('HelpCenter')}
                        showBorder={false}
                        showDivider={true}
                    />
                    <MenuItem
                        icon="document-text-outline"
                        label="Điều khoản dịch vụ"
                        subtitle="Đọc điều khoản của chúng tôi"
                        // onPress={() => handleNavigation('Terms')}
                        showBorder={false}
                        showDivider={true}
                    />
                    <MenuItem
                        icon="mail-outline"
                        label="Liên hệ"
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
                        Phiên bản 1.0.0
                    </AppText>
                    <AppText size="xs" color={theme.colors.text.secondary} centered>
                        Được làm với ❤️ bởi nhóm Npm Run Dev.
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