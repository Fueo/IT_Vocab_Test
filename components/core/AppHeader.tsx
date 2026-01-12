import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar'; // Thêm import này
import React, { ReactNode } from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

import theme from '../../theme';
import AppText from './AppText';

const { width } = Dimensions.get('window');

interface AppHeaderProps {
    title: string;
    subtitle?: string;
    rightComponent?: ReactNode;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    showRightIconBackground?: boolean;
    gradientColors?: [string, string, ...string[]];
    bottomContent?: ReactNode;
    containerStyle?: ViewStyle;
    height?: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    subtitle,
    rightComponent,
    rightIcon,
    onRightIconPress,
    showRightIconBackground = true,
    gradientColors = [theme.colors.gradientStart, theme.colors.gradientEnd],
    bottomContent,
    containerStyle,
    height
}) => {
    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.container,
                containerStyle,
                height ? { height } : (bottomContent ? { minHeight: 220 } : { height: 180 })
            ]}
        >
            {/* Tự động đổi màu chữ StatusBar thành trắng khi Header này hiển thị */}
            <StatusBar style="light" />

            <View style={styles.topRow}>
                <View style={styles.textContainer}>
                    <AppText
                        size="title"
                        weight="bold"
                        color="white"
                        style={styles.title}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {title}
                    </AppText>
                    {subtitle && (
                        <AppText
                            size="sm"
                            color="rgba(255,255,255,0.9)"
                            numberOfLines={1}
                        >
                            {subtitle}
                        </AppText>
                    )}
                </View>

                <View style={styles.rightSideWrapper}>
                    {rightComponent ? (
                        <View style={styles.rightComponentContainer}>
                            {rightComponent}
                        </View>
                    ) : (
                        rightIcon && (
                            <TouchableOpacity
                                onPress={onRightIconPress}
                                activeOpacity={0.7}
                                style={[
                                    styles.iconContainer,
                                    showRightIconBackground && styles.iconBackground
                                ]}
                            >
                                <Ionicons
                                    name={rightIcon}
                                    size={24}
                                    color={theme.colors.text.white}
                                />
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>

            {bottomContent && (
                <View style={styles.bottomContainer}>
                    {bottomContent}
                </View>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        paddingHorizontal: theme.spacing.md, // Đồng nhất với margin 16px của app
        paddingTop: theme.spacing.xl * 1.5,
        paddingBottom: theme.spacing.lg,
        borderBottomLeftRadius: theme.radius.xl,
        borderBottomRightRadius: theme.radius.xl,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    textContainer: {
        flex: 1,
        paddingRight: theme.spacing.sm,
        justifyContent: 'center',
    },
    title: {
        marginBottom: theme.spacing.xxs, // Thay 4px bằng theme.spacing.xxs (2px) hoặc xs (4px)
        fontSize: theme.fontSizes.title, // Sử dụng fontSizes từ theme (28px)
        lineHeight: theme.fontSizes.title + 4,
    },
    rightSideWrapper: {
        flexShrink: 0,
        minWidth: 48,
        alignItems: 'flex-end',
    },
    rightComponentContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBackground: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.md, // Chuẩn hóa bo góc theo theme
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    bottomContainer: {
        marginTop: 'auto',
        width: '100%',
    }
});

export default AppHeader;