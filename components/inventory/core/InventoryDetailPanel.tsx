import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import theme from '../../../theme';
import AppButton from '../../core/AppButton';
import AppText from '../../core/AppText';
import { InventoryItem } from '../InventoryView';
import InventorySlot from './InventorySlot';

interface InventoryDetailPanelProps {
    selectedItem: InventoryItem | null;
    onUseItem: () => void;
}

const InventoryDetailPanel: React.FC<InventoryDetailPanelProps> = ({ selectedItem, onUseItem }) => {
    if (!selectedItem) {
        return (
            <View style={styles.detailPanel}>
                <View style={styles.emptyDetailState}>
                    <Ionicons name="information-circle" size={48} color={theme.colors.text.secondary} />
                    <AppText color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.smd }}>
                        Tap on an item to see details
                    </AppText>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.detailPanel}>
            {/* Header Info */}
            <View style={styles.detailHeaderRow}>
                <View style={styles.bigIconContainer}>
                    {/* Icon Slot */}
                    <InventorySlot item={selectedItem} size={70} />
                </View>

                <View style={styles.detailTitleCol}>
                    <View style={styles.typeTag}>
                        {/* Tag Type vẫn giữ màu trắng vì background màu Primary */}
                        <AppText size="xs" color="white" weight="bold" style={{ textTransform: 'uppercase' }}>
                            {selectedItem.Item.ItemType}
                        </AppText>
                    </View>

                    {/* SỬA: Thêm color={theme.colors.text.primary} cho Tên vật phẩm */}
                    <AppText
                        size="lg"
                        weight="bold"
                        numberOfLines={1}
                        color={theme.colors.text.primary}
                    >
                        {selectedItem.Item.ItemName}
                    </AppText>

                    <View style={styles.statusRow}>
                        <Ionicons
                            name={selectedItem.IsActive ? "radio-button-on" : "radio-button-off"}
                            size={theme.iconSizes.sm}
                            color={selectedItem.IsActive ? theme.colors.success : theme.colors.text.secondary}
                        />
                        <AppText
                            size="xs"
                            color={selectedItem.IsActive ? theme.colors.success : theme.colors.text.secondary}
                            style={{ marginLeft: theme.spacing.xs }}
                        >
                            {selectedItem.IsActive ? "Active" : "Inactive"}
                        </AppText>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.descriptionBox}>
                <AppText size="sm" color={theme.colors.text.secondary} style={{ lineHeight: 20 }}>
                    {selectedItem.Item.Description}
                </AppText>
            </ScrollView>

            {/* Stats & Button */}
            <View style={styles.footerAction}>
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <AppText size="xs" color={theme.colors.text.secondary}>Quantity</AppText>
                        {/* SỬA: Thêm color cho số lượng */}
                        <AppText weight="bold" color={theme.colors.text.primary}>
                            {selectedItem.Quantity}
                        </AppText>
                    </View>
                    <View style={styles.infoItem}>
                        <AppText size="xs" color={theme.colors.text.secondary}>Duration</AppText>
                        {/* SỬA: Thêm color cho thời hạn */}
                        <AppText weight="bold" color={theme.colors.text.primary}>
                            {selectedItem.Item.DurationValue > 0
                                ? `${selectedItem.Item.DurationValue} ${selectedItem.Item.DurationType}`
                                : '∞'}
                        </AppText>
                    </View>
                </View>

                <AppButton
                    title={selectedItem.IsActive ? "Equipped" : "Use Item"}
                    variant="primary"
                    onPress={onUseItem}
                    disabled={selectedItem.IsActive}
                    style={styles.actionButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    detailPanel: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        padding: theme.spacing.md,
        height: 270, // ✅ giảm từ 280 -> 200
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    emptyDetailState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailHeaderRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.sm,
    },
    bigIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    detailTitleCol: {
        flex: 1,
        justifyContent: 'center',
    },
    typeTag: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.radius.sm,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    descriptionBox: {
        flex: 1,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.cardBackground,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.sm,
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoGrid: {
        flex: 1,
        flexDirection: 'row',
        gap: theme.spacing.lg,
    },
    infoItem: {
        alignItems: 'flex-start',
    },
    actionButton: {
        flex: 1,
        maxWidth: 150,
    },
});

export default InventoryDetailPanel;