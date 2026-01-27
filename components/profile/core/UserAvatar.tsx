import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import theme from "../../../theme";
import AppText from "../../core/AppText";

interface UserAvatarProps {
  initials?: string;
  imageUrl?: string;
  size?: number;

  /**
   * ✅ Frame từ URL (backend trả về)
   * VD: profile.equippedSkin.itemImageURL hoặc leaderboard.itemImageURL
   */
  frameImageUrl?: string | null;

  // Scale avatar khi có khung
  avatarScale?: number;

  // Badge / icon overlay
  children?: React.ReactNode;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  initials = "U",
  imageUrl,
  size = 100,
  frameImageUrl,
  avatarScale = 0.82,
  children,
}) => {
  const frameUri = useMemo(() => {
    const url = String(frameImageUrl ?? "").trim();
    return url ? url : null;
  }, [frameImageUrl]);

  const hasFrame = !!frameUri;

  const finalScale = hasFrame ? avatarScale : 1;
  const avatarSize = size * finalScale;
  const avatarRadius = avatarSize / 2;
  const fontSize = avatarSize * 0.4;

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {/* Avatar */}
      <View style={styles.centerLayer}>
        <View
          style={[
            styles.avatarContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarRadius,
              borderWidth: 1,
              borderColor: "#FFFFFF",
            },
          ]}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <AppText size="huge" weight="bold" color={theme.colors.success} style={{ fontSize }}>
                {initials}
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* Frame (remote only) */}
      {frameUri && (
        <Image
          source={{ uri: frameUri }}
          style={[styles.frameImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      )}

      {/* Badge */}
      {children && <View style={styles.badgeContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  centerLayer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  avatarContainer: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  frameImage: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  badgeContainer: {
    position: "absolute",
    bottom: -30,
    zIndex: 999,
    elevation: 20,
  },
});

export default UserAvatar;
