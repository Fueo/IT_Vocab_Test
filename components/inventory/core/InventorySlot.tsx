import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '../../../theme';
import AppText from '../../core/AppText';
import UserAvatar from '../../profile/core/UserAvatar';
import { InventoryItem } from '../InventoryView'; // Bạn có thể để interface chung 1 file hoặc import từ View

// Mock Library ảnh (hoặc import từ file config chung)
const FRAME_LIBRARY: Record<string, ImageSourcePropType> = {
    'frame1': require('../../../media/frames/avatar_frame1.png'),
    'frame2': require('../../../media/frames/avatar_frame2.png'),
    'frame3': require('../../../media/frames/avatar_frame3.png'),
    'frame4': require('../../../media/frames/avatar_frame4.png'),
    'frame5': require('../../../media/frames/avatar_frame5.png'),
    'frame6': require('../../../media/frames/avatar_frame6.png'),
};

interface InventorySlotProps {
    item?: InventoryItem; // Có thể null nếu là slot trống
    size: number;
    isSelected?: boolean;
    onPress?: () => void;
}

const InventorySlot: React.FC<InventorySlotProps> = ({ item, size, isSelected, onPress }) => {
    // 1. Render Slot Trống
    if (!item) {
        return <View style={[styles.slot, styles.slotEmpty, { width: size, height: size }]} />;
    }

    // 2. Render Icon (Consumable hoặc Cosmetic)
    const renderIcon = () => {
        if (item.Item.ItemType === 'Cosmetic') {
            return (
                <UserAvatar
                    size={size}
                    frameSource={FRAME_LIBRARY[item.Item.EffectValue]}
                    initials=""
                    avatarScale={0.8}
                />
            );
        }
        return (
            <View style={[
                styles.consumableIcon,
                {
                    width: size * 0.8,
                    height: size * 0.8,
                    borderRadius: (size * 0.8) / 4,
                    backgroundColor: item.IsActive ? theme.colors.primaryLight : theme.colors.cardBackground
                }
            ]}>
                <Ionicons
                    name="flash"
                    size={size * 0.5}
                    color={item.IsActive ? theme.colors.primary : theme.colors.warning}
                />
            </View>
        );
    };

    // 3. Render Slot có Item
    return (
        <TouchableOpacity
            style={[
                styles.slot,
                { width: size, height: size },
                isSelected && styles.slotSelected,
                item.IsActive && styles.slotActive
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {renderIcon()}

            {/* Badge Quantity */}
            {item.Quantity > 1 && (
                <View style={styles.quantityBadge}>
                    <AppText size="subtitle" weight="bold" color="white" style={{ fontSize: 9 }}>
                        {item.Quantity}
                    </AppText>
                </View>
            )}

            {/* Badge Active */}
            {item.IsActive && (
                <View style={styles.activeBadge}>
                    <Ionicons name="checkmark" size={10} color={theme.colors.text.white} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    slot: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    slotEmpty: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    slotSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
        backgroundColor: theme.colors.primaryLight,
    },
    slotActive: {
        borderColor: theme.colors.warning,
    },
    consumableIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: theme.colors.text.primary,
        paddingHorizontal: 4,
        borderRadius: 4,
        minWidth: 16,
        alignItems: 'center',
    },
    activeBadge: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: theme.colors.success,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
        zIndex: 10,
    },
});

export default InventorySlot;