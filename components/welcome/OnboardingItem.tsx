import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

// Import core components
import { AppText } from '../../components/core';
import theme from '../../theme';

const { width } = Dimensions.get('window');

interface OnboardingItemProps {
    item: {
        id: string;
        title: string;
        description: string;
        icon: keyof typeof Ionicons.glyphMap;
        colors: string[]; // TypeScript hiểu cái này là mảng chuỗi thường
    };
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({ item }) => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Logo Circle */}
                <LinearGradient
                    // --- SỬA LỖI TẠI ĐÂY ---
                    // Ép kiểu (cast) mảng string[] thành tuple [string, string, ...]
                    // để đảm bảo với TypeScript rằng mảng này luôn đủ màu.
                    colors={item.colors as [string, string, ...string[]]}

                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoContainer}
                >
                    <Ionicons name={item.icon} size={60} color="white" />
                </LinearGradient>

                {/* Title */}
                <AppText
                    size="title"
                    weight="bold"
                    color={theme.colors.text.primary}
                    style={styles.title}
                    centered
                >
                    {item.title}
                </AppText>

                {/* Description */}
                <AppText
                    size="sm"
                    color="#8E8E93" // textGrey
                    centered
                    style={styles.description}
                >
                    {item.description}
                </AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        marginTop: -theme.spacing.xl * 2,
    },
    logoContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 26,
        marginBottom: theme.spacing.sm,
        color: '#000',
    },
    description: {
        lineHeight: 22,
    },
});

export default OnboardingItem;