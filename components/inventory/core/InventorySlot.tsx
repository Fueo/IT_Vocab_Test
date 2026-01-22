import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import theme from "../../../theme";
import AppText from "../../core/AppText";
import { InventoryItem } from "../InventoryView";

interface InventorySlotProps {
  item?: InventoryItem;
  size: number;
  isSelected?: boolean;
  onPress?: () => void;
}

const InventorySlot: React.FC<InventorySlotProps> = ({
  item,
  size,
  isSelected,
  onPress,
}) => {
  // 1) Empty slot
  if (!item) {
    return (
      <View style={[styles.slot, styles.slotEmpty, { width: size, height: size }]} />
    );
  }

  const isCosmetic = item.Item.ItemType === "Cosmetic";
  const imageUri = item.Item.ItemImageURL || null;

  const renderIcon = () => {

      return (
        <View style={[styles.imageWrap, { width: size * 0.82, height: size * 0.82 }]}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            // fallback nếu thiếu ảnh
            <Ionicons name="image-outline" size={size * 0.45} color={theme.colors.text.secondary} />
          )}
        </View>
      );

  };

  return (
    <TouchableOpacity
      style={[
        styles.slot,
        { width: size, height: size },
        isSelected && styles.slotSelected,
        item.IsActive && styles.slotActive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {renderIcon()}

      {/* ✅ Quantity badge (đổi sang top-left để không đè tick) */}
      {item.Quantity > 1 && (
        <View style={styles.quantityBadge}>
          <AppText size="subtitle" weight="bold" color="white" style={{ fontSize: 9 }}>
            {item.Quantity}
          </AppText>
        </View>
      )}

      {/* ✅ Active badge: góc phải trên, nền xanh, KHÔNG viền trắng */}
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  slotEmpty: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
    borderStyle: "dashed",
  },
  slotSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.primaryLight,
  },
  slotActive: {
    borderColor: theme.colors.warning,
  },

  // Image
  imageWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  // Consumable icon
  consumableIcon: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Quantity
  quantityBadge: {
    position: "absolute",
    top: 2,
    left: 2, // ✅ top-left
    backgroundColor: theme.colors.text.primary,
    paddingHorizontal: 4,
    borderRadius: 4,
    minWidth: 16,
    alignItems: "center",
  },

  // Active tick
  activeBadge: {
    position: "absolute",
    top: 2,
    right: 2, // ✅ top-right
    backgroundColor: theme.colors.success,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    // ✅ no border
  },
});

export default InventorySlot;
