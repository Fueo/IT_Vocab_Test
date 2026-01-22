import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AppText } from "../../core";

interface HomeStreakBadgeProps {
  streakDays: number;
  unclaimed?: number; // ✅ NEW
}

const HomeStreakBadge: React.FC<HomeStreakBadgeProps> = ({ streakDays, unclaimed = 0 }) => {
  const handlePress = () => {
    router.push("/game/rewards");
  };

  const showBadge = Number(unclaimed) > 0;
  const badgeText = unclaimed > 99 ? "99+" : String(unclaimed);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      <View style={styles.wrapper}>
        {/* ✅ Badge đỏ góc trái trên */}
        {showBadge && (
          <View style={styles.badge}>
            <AppText size="xs" weight="bold" color="white" style={styles.badgeText}>
              {badgeText}
            </AppText>
          </View>
        )}

        <View style={styles.container}>
          <Ionicons name="flame" size={24} color="#FF9500" style={{ marginRight: 8 }} />

          <View>
            <AppText size="lg" weight="bold" color="white" style={{ lineHeight: 24 }}>
              {streakDays}
            </AppText>
            <AppText size="xs" color="rgba(255,255,255,0.8)" style={{ lineHeight: 14 }}>
              day streak
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  // ✅ badge đỏ tròn chữ trắng góc PHẢI TRÊN, KHÔNG viền
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    zIndex: 10,
  },
  badgeText: {
    lineHeight: 14,
  },
});

export default HomeStreakBadge;
