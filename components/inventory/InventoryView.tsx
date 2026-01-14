import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Core
import theme from '../../theme';
import AppDialog from '../core/AppDialog';
import HomeHeader from '../core/HomeHeader';
import PaginationControl from '../core/PaginationControl';

// Import Sub-Components
import InventoryDetailPanel from './core/InventoryDetailPanel';
import InventorySlot from './core/InventorySlot';

// ---------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------
export interface ItemDefinition {
    ItemID: string;
    ItemName: string;
    ItemType: 'Consumable' | 'Cosmetic';
    EffectType: 'XP_Multiplier' | 'Frame_Skin';
    EffectValue: string;
    DurationType: 'Minutes' | 'Days' | 'Permanent';
    DurationValue: number;
    Description: string;
}

export interface InventoryItem {
    InventoryID: string;
    Item: ItemDefinition;
    Quantity: number;
    IsActive: boolean;
    AcquiredAt: string;
    ActivatedAt?: string;
    ExpiredAt?: string;
}

const MOCK_INVENTORY: InventoryItem[] = [
    {
        InventoryID: 'inv_1',
        Quantity: 5,
        IsActive: false,
        AcquiredAt: '2025-10-20',
        Item: {
            ItemID: 'item_xp_x2',
            ItemName: 'Double XP Potion',
            ItemType: 'Consumable',
            EffectType: 'XP_Multiplier',
            EffectValue: '2',
            DurationType: 'Minutes',
            DurationValue: 30,
            Description: 'Doubles your XP gain for 30 minutes. Perfect for grinding sessions.',
        },
    },
    {
        InventoryID: 'inv_2',
        Quantity: 2,
        IsActive: true,
        AcquiredAt: '2025-10-21',
        Item: {
            ItemID: 'item_xp_x3',
            ItemName: 'Triple XP Elixir',
            ItemType: 'Consumable',
            EffectType: 'XP_Multiplier',
            EffectValue: '3',
            DurationType: 'Minutes',
            DurationValue: 15,
            Description: 'Triples your XP gain. Very rare and powerful.',
        },
    },
    ...['frame1', 'frame2', 'frame3', 'frame4', 'frame5', 'frame6'].map((frameId, index) => ({
        InventoryID: `inv_frame_${index}`,
        Quantity: 1,
        IsActive: index === 0,
        AcquiredAt: '2025-10-22',
        Item: {
            ItemID: `item_${frameId}`,
            ItemName: `Mystic Frame ${index + 1}`,
            ItemType: 'Cosmetic' as const,
            EffectType: 'Frame_Skin' as const,
            EffectValue: frameId,
            DurationType: 'Permanent' as const,
            DurationValue: 0,
            Description: 'A legendary frame to show off your style on the leaderboard.',
        },
    })),
    ...Array.from({ length: 8 }).map((_, i) => ({
        InventoryID: `inv_filler_${i}`,
        Quantity: 10 + i,
        IsActive: false,
        AcquiredAt: '2025-10-25',
        Item: {
            ItemID: `item_energy_${i}`,
            ItemName: 'Energy Drink',
            ItemType: 'Consumable' as const,
            EffectType: 'XP_Multiplier' as const,
            EffectValue: '1.2',
            DurationType: 'Minutes' as const,
            DurationValue: 60,
            Description: 'Boosts energy slightly.',
        },
    })),
];

// ---------------------------------------------------------
// Layout Config
// ---------------------------------------------------------
const { width } = Dimensions.get('window');

const ITEMS_PER_ROW = 5;
const ITEMS_PER_PAGE = 15;

const SCREEN_PADDING = theme.spacing.md;
const FRAME_PADDING = theme.spacing.smd;
const GAP_SIZE = theme.spacing.sm;

// Slot size calc
const AVAILABLE_WIDTH = width - SCREEN_PADDING * 2 - FRAME_PADDING * 2;
const TOTAL_GAPS = (ITEMS_PER_ROW - 1) * GAP_SIZE;
const SLOT_SIZE = (AVAILABLE_WIDTH - TOTAL_GAPS) / ITEMS_PER_ROW;

// ✅ Giảm wrapper height (panel sẽ tự nhỏ theo InventoryDetailPanel)
const DETAIL_PANEL_HEIGHT = 210;

// ✅ thêm khoảng buffer chống tab bar đè
const TAB_BAR_BUFFER = 16;

const InventoryView = () => {
    const insets = useSafeAreaInsets();

    const [currentPage, setCurrentPage] = useState(0);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const totalPages = Math.ceil(MOCK_INVENTORY.length / ITEMS_PER_PAGE);

    const currentItems = useMemo(() => {
        return MOCK_INVENTORY.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
    }, [currentPage]);

    const handleUseItem = () => {
        if (!selectedItem) return;

        const msg =
            selectedItem.Item.ItemType === 'Cosmetic'
                ? `You have equipped ${selectedItem.Item.ItemName}!`
                : `You used ${selectedItem.Item.ItemName}. Effect active for ${selectedItem.Item.DurationValue} ${selectedItem.Item.DurationType}.`;

        setSuccessMessage(msg);
        setShowSuccessDialog(true);
    };

    return (
        <View style={styles.container}>
            <HomeHeader
                title="Inventory"
                subtitle={`Storage: ${MOCK_INVENTORY.length} Items`}
                rightIcon="filter"
                onRightIconPress={() => console.log('Filter pressed')}
            />

            <View style={styles.body}>
                {/* GRID + PAGINATION */}
                <View style={styles.gridWrapper}>
                    <View style={styles.inventoryFrame}>
                        <View style={styles.gridRow}>
                            {currentItems.map((item) => (
                                <InventorySlot
                                    key={item.InventoryID}
                                    item={item}
                                    size={SLOT_SIZE}
                                    isSelected={selectedItem?.InventoryID === item.InventoryID}
                                    onPress={() => setSelectedItem(item)}
                                />
                            ))}

                            {Array.from({ length: ITEMS_PER_PAGE - currentItems.length }).map((_, i) => (
                                <InventorySlot key={`empty_${i}`} size={SLOT_SIZE} />
                            ))}
                        </View>

                        <PaginationControl
                            currentPage={currentPage + 1}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page - 1)}
                        />
                    </View>
                </View>

                {/* ✅ DETAIL: chừa đáy để không bị navigation/tab bar đè */}
                <View
                    style={[
                        styles.detailWrapper,
                        {
                            paddingBottom: insets.bottom + TAB_BAR_BUFFER,
                        },
                    ]}
                >
                    <InventoryDetailPanel selectedItem={selectedItem} onUseItem={handleUseItem} />
                </View>
            </View>

            <AppDialog
                visible={showSuccessDialog}
                type="success"
                title="Success"
                message={successMessage}
                onClose={() => setShowSuccessDialog(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.cardBackground,
    },
    body: {
        flex: 1,
    },

    gridWrapper: {
        padding: SCREEN_PADDING,
        paddingBottom: theme.spacing.sm,
    },
    inventoryFrame: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.lg,
        padding: FRAME_PADDING,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP_SIZE,
    },

    // ✅ wrapper cho detail: fix chiều cao + chừa đáy
    detailWrapper: {
        height: DETAIL_PANEL_HEIGHT,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
});

export default InventoryView;
