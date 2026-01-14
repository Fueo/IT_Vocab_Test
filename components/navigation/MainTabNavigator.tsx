import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// Import Theme & Components
import theme from '../../theme';
import TabBarIcon from './TabBarIcon';

const MainTabNavigator = () => {
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
                    height: Platform.OS === 'ios' ? 88 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                    elevation: 0,
                },
            }}
        >
            {/* Tab 1: Learn */}
            <Tabs.Screen
                name="quiz" // Tên file là quiz.tsx
                options={{
                    title: 'Learn',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="home" color={color} focused={focused} />
                    ),
                }}
            />

            {/* Tab 2: Dictionary */}
            <Tabs.Screen
                name="dictionary"
                options={{
                    title: 'Dictionary',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="book" color={color} focused={focused} />
                    ),
                }}
            />

            {/* Tab 3: Ranks */}
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Leaderboard',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="trophy" color={color} focused={focused} />
                    ),
                }}
            />

            {/* Tab 4: Shop */}
            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'inventory',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="bag-handle" color={color} focused={focused} />
                    ),
                }}
            />

            {/* Tab 5: Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="person" color={color} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default MainTabNavigator;