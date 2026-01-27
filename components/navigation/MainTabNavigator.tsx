import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
// 1. THÊM IMPORT NÀY
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Theme & Components
import theme from '../../theme';
import TabBarIcon from './TabBarIcon';

const MainTabNavigator = () => {
    // 2. LẤY THÔNG SỐ KHOẢNG CÁCH AN TOÀN
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                // 1. Màu sắc
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.secondary,
                tabBarActiveBackgroundColor: theme.colors.primaryLight,
                // 2. Ẩn Header
                headerShown: false,

                // 3. Font chữ
                tabBarLabelStyle: {
                    fontFamily: theme.fonts.medium,
                    fontSize: theme.fontSizes.subtitle,
                    marginBottom: Platform.OS === 'ios' ? 0 : 4,
                },

                // 4. Style Bottom Bar
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,

                    // 3. SỬA ĐOẠN NÀY ĐỂ TRÁNH NÚT ẢO
                    // Tự động cộng thêm chiều cao của nút ảo vào height
                    height: Platform.OS === 'ios' ? 88 : 60 + insets.bottom,
                    // Đẩy nội dung lên trên, không bị nút ảo che mất
                    paddingBottom: Platform.OS === 'ios' ? 28 : insets.bottom,

                    elevation: 0,
                },
            }}
        >
            {/* ... Các Tabs giữ nguyên như cũ ... */}
            <Tabs.Screen
                name="quiz"
                options={{
                    title: 'Quiz',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="home" color={color} focused={focused} />
                    ),
                }}
            />
            {/* ... (Các tab khác giữ nguyên) ... */}
            <Tabs.Screen name="dictionary" options={{ title: 'Từ điển', tabBarIcon: ({ color, focused }) => <TabBarIcon name="book" color={color} focused={focused} /> }} />
            <Tabs.Screen name="leaderboard" options={{ title: 'Xếp hạng', tabBarIcon: ({ color, focused }) => <TabBarIcon name="trophy" color={color} focused={focused} /> }} />
            <Tabs.Screen name="inventory" options={{ title: 'Kho đồ', tabBarIcon: ({ color, focused }) => <TabBarIcon name="bag-handle" color={color} focused={focused} /> }} />
            <Tabs.Screen name="profile" options={{ title: 'Hồ sơ', tabBarIcon: ({ color, focused }) => <TabBarIcon name="person" color={color} focused={focused} /> }} />
        </Tabs>
    );
};

export default MainTabNavigator;