// core/RewardCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import theme from "../../../theme";
import AppText from "../../core/AppText";
import UserAvatar from "../../profile/core/UserAvatar";
import { Reward } from "./rewards.data";

type Props = {
  reward: Reward;
  onPress?: (reward: Reward) => void;
  onClaim?: (reward: Reward) => void;
};

const RewardCard: React.FC<Props> = ({ reward, onPress, onClaim }) => {
  const state = reward.state ?? "locked";
  const isLocked = state === "locked";
  const isClaimable = state === "claimable";
  const isClaimed = state === "claimed";

  const firstItem = reward.items?.[0];
  const itemImageURL = firstItem?.itemImageURL || null;

  const badgeText = isLocked ? "Locked" : isClaimable ? "Claimable" : "Claimed";
  const pillStyle = isLocked ? styles.pillLocked : styles.pillUnlocked;
  const pillTextColor = isLocked ? theme.colors.text.secondary : "white";

  const claimBtnDisabled = !isClaimable;
  const claimBtnText = isLocked ? "Locked" : isClaimed ? "Claimed" : "Claim";
  const claimBtnIcon = isLocked ? "lock-closed" : isClaimed ? "checkmark" : "gift";

  // ✅ Fix chữ quá to màn nhỏ: giảm size + lineHeight khi cần
  // (Không phụ thuộc Dimensions; đơn giản, ổn định)
  const titleSize = useMemo(() => ("sm" as const), []);
  const descSize = useMemo(() => ("xs" as const), []);
  const pillSize = useMemo(() => ("xs" as const), []);
  const btnSize = useMemo(() => ("xs" as const), []);

  const renderLeft = () => {
    if (itemImageURL) {
      return (
        <View style={styles.iconBox}>
          {/* ✅ hình theo %: dùng width/height 100% + padding container */}
          <Image
            source={{ uri: itemImageURL }}
            style={styles.itemImagePercent}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (reward.type === "frame" && reward.frameId) {
      return (
        <View style={styles.preview}>
          <UserAvatar size={52} initials="" frameId={reward.frameId} avatarScale={0.82} />
        </View>
      );
    }

    return (
      <View style={styles.iconBox}>
        <Ionicons
          name={(reward.icon as any) || "gift"}
          size={24} // ✅ nhỏ nhẹ hơn
          color={theme.colors.text.primary}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(reward)}
      style={[styles.card, (isClaimable || isClaimed) && styles.cardUnlocked]}
    >
      {renderLeft()}

      <View style={styles.content}>
        {/* Title */}
        <AppText
          weight="bold"
          size={titleSize}
          color={theme.colors.text.primary}
          numberOfLines={1}
          style={styles.titleText}
        >
          {reward.title}
        </AppText>

        {/* Description */}
        <AppText
          size={descSize}
          color={theme.colors.text.secondary}
          style={styles.descText}
          numberOfLines={2}
        >
          {reward.description}
        </AppText>

        {/* Badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.pill, pillStyle]}>
            <AppText size={pillSize} weight="bold" color={pillTextColor}>
              {badgeText}
            </AppText>
          </View>
        </View>
      </View>

      {/* Right side: Claim button */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={claimBtnDisabled}
        onPress={() => onClaim?.(reward)}
        style={[
          styles.rightClaimBtn,
          claimBtnDisabled ? styles.rightClaimBtnDisabled : styles.rightClaimBtnActive,
          isClaimed && styles.rightClaimBtnClaimed,
        ]}
      >
        <Ionicons
          name={claimBtnIcon as any}
          size={14} // ✅ nhỏ hơn để không “phình” trên màn nhỏ
          color={claimBtnDisabled ? theme.colors.text.secondary : "white"}
        />
        <AppText
          size={btnSize}
          weight="bold"
          color={claimBtnDisabled ? theme.colors.text.secondary : "white"}
          style={{ marginLeft: 6 }}
          numberOfLines={1}
        >
          {claimBtnText}
        </AppText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  cardUnlocked: {
    borderColor: theme.colors.success,
  },

  preview: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    overflow: "hidden",

    // ✅ tạo “padding” bên trong để ảnh % không đụng viền
    padding: 8,
  },

  // ✅ ảnh theo % của iconBox
  itemImagePercent: {
    width: "100%",
    height: "100%",
  },

  content: {
    flex: 1,
    paddingRight: theme.spacing.sm,
    minWidth: 0, // ✅ giúp text ellipsis đúng trong row
  },

  // ✅ fix chữ to/overflow trên màn nhỏ: hạ lineHeight + shrink
  titleText: {
    flexShrink: 1,
    lineHeight: 18,
  },
  descText: {
    marginTop: theme.spacing.xxs,
    lineHeight: 16,
  },

  badgeRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "flex-start",
  },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  pillLocked: {
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
  },
  pillUnlocked: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },

  rightClaimBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10, // ✅ giảm chút cho màn nhỏ
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  rightClaimBtnDisabled: {
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
  },
  rightClaimBtnActive: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success,
  },
  rightClaimBtnClaimed: {
    opacity: 0.75,
  },
});

export default RewardCard;
