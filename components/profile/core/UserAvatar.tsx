import React, { useMemo } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import theme from "../../../theme";
import AppText from "../../core/AppText";

type FrameId = "frame1" | "frame2" | "frame3" | "frame4" | "frame5" | "frame6";

// ✅ FRAME LIBRARY (local) - giữ lại để tương thích
const FRAME_LIBRARY: Record<FrameId, ImageSourcePropType> = {
  frame1: require("../../../media/frames/avatar_frame1.png"),
  frame2: require("../../../media/frames/avatar_frame2.png"),
  frame3: require("../../../media/frames/avatar_frame3.png"),
  frame4: require("../../../media/frames/avatar_frame4.png"),
  frame5: require("../../../media/frames/avatar_frame5.png"),
  frame6: require("../../../media/frames/avatar_frame6.png"),
};

const getFrameSourceFromId = (frameId?: string) => {
  if (!frameId) return undefined;
  return FRAME_LIBRARY[frameId as FrameId];
};

interface UserAvatarProps {
  initials?: string;
  imageUrl?: string;
  size?: number;

  /**
   * ✅ NEW: Frame từ URL (backend trả về, ví dụ profile.equippedSkin.itemImageURL)
   * Nếu có frameImageUrl thì sẽ dùng frame theo URL.
   */
  frameImageUrl?: string | null;

  /**
   * ✅ Legacy: dùng frame local theo id
   */
  frameId?: FrameId;

  /**
   * ✅ Legacy: truyền source trực tiếp (ưu tiên cao nhất)
   */
  frameSource?: ImageSourcePropType;

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
  frameId,
  frameSource,

  avatarScale = 0.82,
  children,
}) => {
  /**
   * ✅ Resolve frame theo ưu tiên:
   * 1) frameSource (local/manual)
   * 2) frameImageUrl (remote)
   * 3) frameId (local library)
   */
  const resolvedFrame = useMemo<{
    kind: "none" | "local" | "remote";
    source?: ImageSourcePropType;
    uri?: string;
  }>(() => {
    if (frameSource) return { kind: "local", source: frameSource };

    const url = (frameImageUrl ?? "").trim();
    if (url) return { kind: "remote", uri: url };

    const byId = getFrameSourceFromId(frameId);
    if (byId) return { kind: "local", source: byId };

    return { kind: "none" };
  }, [frameSource, frameImageUrl, frameId]);

  const hasFrame = resolvedFrame.kind !== "none";

  // Nếu có khung thì avatar nhỏ lại, không có khung thì full size
  const finalScale = hasFrame ? avatarScale : 1;

  const avatarSize = size * finalScale;
  const avatarRadius = avatarSize / 2;
  const fontSize = avatarSize * 0.4;

  const renderAvatarContent = () => (
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
          <AppText
            size="huge"
            weight="bold"
            color={theme.colors.success}
            style={{ fontSize }}
          >
            {initials}
          </AppText>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {/* Avatar */}
      <View style={styles.centerLayer}>{renderAvatarContent()}</View>

      {/* Frame */}
      {resolvedFrame.kind === "local" && resolvedFrame.source && (
        <Image
          source={resolvedFrame.source}
          style={[styles.frameImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      )}

      {resolvedFrame.kind === "remote" && resolvedFrame.uri && (
        <Image
          source={{ uri: resolvedFrame.uri }}
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
