import React from 'react';
import { StyleSheet } from 'react-native';

// Import Component đã tách
import InventoryView from '@/components/inventory/InventoryView';

const InventoryScreen = () => {
    return (
        <InventoryView />
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
});

export default InventoryScreen;