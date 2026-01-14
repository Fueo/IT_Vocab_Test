import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import theme from '../../theme';
import { AppText } from '../core';

interface AvatarPickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onImageSelected: (uri: string) => void;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = width / COLUMN_COUNT;

const AvatarPickerSheet: React.FC<AvatarPickerSheetProps> = ({ visible, onClose, onImageSelected }) => {
    const [photos, setPhotos] = useState<any[]>([]);
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

    // Load ảnh từ thư viện khi mở modal
    useEffect(() => {
        if (visible) {
            loadImages();
        }
    }, [visible]);

    const loadImages = async () => {
        if (!permissionResponse?.granted) {
            const permission = await requestPermission();
            if (!permission.granted) return;
        }

        // Lấy 20 ảnh gần nhất
        const assets = await MediaLibrary.getAssetsAsync({
            first: 20,
            mediaType: MediaLibrary.MediaType.photo,
            sortBy: [MediaLibrary.SortBy.creationTime],
        });

        // Thêm một item giả vào đầu danh sách để làm nút Camera
        setPhotos([{ id: 'camera-placeholder' }, ...assets.assets]);
    };

    // Xử lý chụp ảnh
    const handleTakePhoto = async () => {
        try {
            // 1. Kiểm tra quyền
            if (!cameraPermission?.granted) {
                const permission = await requestCameraPermission();
                if (!permission.granted) {
                    Alert.alert("Quyền bị từ chối", "Ứng dụng cần quyền truy cập Camera để chụp ảnh.");
                    return;
                }
            }

            // 2. Gọi Camera
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Dùng MediaTypeOptions để tránh lỗi TS
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                onImageSelected(result.assets[0].uri);
                onClose();
            }
        } catch (error) {
            console.log("Camera Error:", error);
            // 3. Thông báo lỗi thân thiện thay vì Crash app
            Alert.alert(
                "Không thể mở Camera",
                "Thiết bị này không có ứng dụng Camera hoặc Camera bị lỗi. Vui lòng kiểm tra lại cài đặt máy ảo hoặc chọn ảnh từ thư viện."
            );
        }
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        // --- Ô ĐẦU TIÊN: NÚT CAMERA ---
        if (item.id === 'camera-placeholder') {
            return (
                <TouchableOpacity
                    style={[styles.itemContainer, styles.cameraItem]}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                >
                    <Ionicons name="camera" size={32} color={theme.colors.text.secondary} />
                    <AppText size="xs" color={theme.colors.text.secondary} style={{ marginTop: 4 }}>
                        Take Photo
                    </AppText>
                </TouchableOpacity>
            );
        }

        // --- CÁC Ô SAU: ẢNH TỪ THƯ VIỆN ---
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                    onImageSelected(item.uri);
                    onClose();
                }}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: item.uri }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <View style={styles.sheetContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <AppText size="md" weight="bold">Choose Profile Photo</AppText>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Grid Ảnh */}
                    <FlatList
                        data={photos}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        numColumns={COLUMN_COUNT}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '50%', // Chiếm 50% màn hình dưới
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    closeBtn: {
        padding: 4,
    },
    itemContainer: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderWidth: 1,
        borderColor: 'white', // Tạo khoảng cách nhỏ giữa các ảnh
    },
    cameraItem: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default AvatarPickerSheet;