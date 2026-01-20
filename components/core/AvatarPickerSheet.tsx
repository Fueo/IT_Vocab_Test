// src/screens/profile/core/AvatarPickerSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import theme from "../../theme";
import { AppText } from "../core";

export type AvatarPickedAsset = {
  uri: string;        // ưu tiên file:// (localUri)
  mimeType?: string;  // image/jpeg | image/png | image/webp
  fileName?: string;  // abc.jpg
};

interface AvatarPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (asset: AvatarPickedAsset) => void;
  limit?: number; // số ảnh load (default 30)
}

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_SIZE = width / COLUMN_COUNT;

type GridItem =
  | { id: "camera-placeholder" }
  | MediaLibrary.Asset;

// ---- helpers ----
function ensureFilename(name?: string) {
  if (name && name.trim().length > 0) return name;
  return `avatar-${Date.now()}.jpg`;
}

function guessMimeFromName(name?: string) {
  const n = (name || "").toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

const AvatarPickerSheet: React.FC<AvatarPickerSheetProps> = ({
  visible,
  onClose,
  onImageSelected,
  limit = 30,
}) => {
  const [photos, setPhotos] = useState<GridItem[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  useEffect(() => {
    if (visible) {
      loadImages().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadImages = async () => {
    // xin quyền thư viện
    if (!permissionResponse?.granted) {
      const p = await requestPermission();
      if (!p.granted) return;
    }

    const assets = await MediaLibrary.getAssetsAsync({
      first: limit,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    // add tile camera vào đầu
    setPhotos([{ id: "camera-placeholder" }, ...assets.assets]);
  };

  // ===== Camera =====
  const handleTakePhoto = async () => {
    try {
      // xin quyền camera
      if (!cameraPermission?.granted) {
        const p = await requestCameraPermission();
        if (!p.granted) {
          Alert.alert(
            "Quyền bị từ chối",
            "Ứng dụng cần quyền truy cập Camera để chụp ảnh."
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"], // ✅ expo-image-picker 17 / sdk 54
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const fileName =
        (asset as any).fileName ??
        ensureFilename(asset.uri.split("/").pop() || undefined);

      const mimeType = asset.mimeType ?? guessMimeFromName(fileName);

      onImageSelected({
        uri: asset.uri,
        fileName,
        mimeType,
      });

      onClose();
    } catch (error) {
      console.log("Camera Error:", error);
      Alert.alert(
        "Không thể mở Camera",
        "Thiết bị này không có ứng dụng Camera hoặc Camera bị lỗi. Vui lòng chọn ảnh từ thư viện."
      );
    }
  };

  // ===== Pick from grid =====
  const handlePickFromGrid = async (asset: MediaLibrary.Asset) => {
    try {
      const info = await MediaLibrary.getAssetInfoAsync(asset.id);
      const uri = info.localUri || info.uri || asset.uri;

      const fileName = ensureFilename(
        info.filename || uri.split("/").pop() || undefined
      );
      const mimeType = guessMimeFromName(fileName);

      onImageSelected({ uri, fileName, mimeType });
      onClose();
    } catch (e) {
      // fallback
      const uri = asset.uri;
      const fileName = ensureFilename(uri.split("/").pop() || undefined);
      const mimeType = guessMimeFromName(fileName);

      onImageSelected({ uri, fileName, mimeType });
      onClose();
    }
  };

  const renderItem = ({ item }: { item: GridItem }) => {
    // tile camera
    if ((item as any).id === "camera-placeholder") {
      return (
        <TouchableOpacity
          style={[styles.itemContainer, styles.cameraItem]}
          onPress={handleTakePhoto}
          activeOpacity={0.75}
        >
          <Ionicons
            name="camera"
            size={32}
            color={theme.colors.text.secondary}
          />
          <AppText
            size="xs"
            color={theme.colors.text.secondary}
            style={{ marginTop: 4 }}
          >
            Take Photo
          </AppText>
        </TouchableOpacity>
      );
    }

    // tile ảnh
    const asset = item as MediaLibrary.Asset;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handlePickFromGrid(asset)}
        activeOpacity={0.75}
      >
        <Image source={{ uri: asset.uri }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <AppText size="md" weight="bold">
              Choose Profile Photo
            </AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Grid */}
          <FlatList
            data={photos}
            renderItem={renderItem}
            keyExtractor={(it) => (it as any).id}
            numColumns={COLUMN_COUNT}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AvatarPickerSheet;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "50%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  closeBtn: { padding: 4 },

  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderWidth: 1,
    borderColor: "white",
  },
  cameraItem: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
