import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import theme from '../../theme';
import AppText from './AppText';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle?: string;       // Mới: Dòng text phụ bên dưới
    onPress?: () => void;
    isDestructive?: boolean;
    showChevron?: boolean;
    showBorder?: boolean;    // Cũ: Viền bao quanh khung
    showDivider?: boolean;   // Mới: Đường kẻ ngăn cách bên dưới (dùng trong danh sách)
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    label,
    subtitle,
    onPress,
    isDestructive = false,
    showChevron = true,
    showBorder = true,
    showDivider = false,
}) => {
    const itemColor = isDestructive ? theme.colors.error : theme.colors.text.primary;

    return (
        <View>
            <TouchableOpacity
                style={[
                    styles.container,
                    // Nếu showBorder = true thì có nền, bo góc, viền (dùng cho nút đơn)
                    // Nếu showBorder = false thì trong suốt, vuông vức (dùng trong list)
                    showBorder ? styles.borderedContainer : styles.listContainer,
                    isDestructive && showBorder && { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.leftContent}>
                    {/* Icon Circle */}
                    <View style={[styles.iconCircle, isDestructive && { backgroundColor: '#FEF2F2' }]}>
                        <Ionicons
                            name={icon}
                            size={20} // Size icon chuẩn trong list
                            color={itemColor}
                        />
                    </View>

                    {/* Text Container */}
                    <View style={styles.textWrapper}>
                        <AppText
                            size="md"
                            weight="bold"
                            color={itemColor}
                        >
                            {label}
                        </AppText>
                        {subtitle && (
                            <AppText size="xs" color={theme.colors.text.secondary}>
                                {subtitle}
                            </AppText>
                        )}
                    </View>
                </View>

                {showChevron && (
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.colors.text.secondary}
                    />
                )}
            </TouchableOpacity>

            {/* Divider Logic */}
            {showDivider && <View style={styles.divider} />}
        </View>
    );
};

const styles = StyleSheet.create({
    // Container chung
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // Style cho nút đứng một mình (có viền, bo góc)
    borderedContainer: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    // Style cho nút trong danh sách (Setting)
    listContainer: {
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
        backgroundColor: '#F3F4F6', // Vòng tròn xám nhạt
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
        marginLeft: 68, // Căn lề để không cắt qua icon (36 + 16 + 16)
    },
});

export default MenuItem;