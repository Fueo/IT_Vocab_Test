import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import AppText from '../../core/AppText';

interface UserAvatarProps {
    initials?: string;
    imageUrl?: string;
    size?: number;

    // Truyền trực tiếp ảnh vào (hoặc null/undefined nếu không muốn hiện khung)
    frameSource?: ImageSourcePropType;

    // Tùy chỉnh độ to nhỏ của avatar bên trong
    avatarScale?: number;

    children?: React.ReactNode;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    initials = 'U',
    imageUrl,
    size = 100,
    frameSource,
    avatarScale = 0.82,
    children,
}) => {
    // Logic scale: Nếu không có khung, avatar to 100%. Có khung thì thu nhỏ lại (0.82)
    const finalScale = frameSource ? avatarScale : 1;

    const avatarSize = size * finalScale;
    const avatarRadius = avatarSize / 2;
    const fontSize = avatarSize * 0.4;

    // --- RENDER AVATAR ---
    const renderAvatarContent = () => (
        <View style={[
            styles.avatarContainer,
            { width: avatarSize, height: avatarSize, borderRadius: avatarRadius },

            // LOGIC QUAN TRỌNG:
            // - Nếu KHÔNG có frameSource -> Áp dụng style viền trắng + bóng đổ.
            // - Nếu CÓ frameSource -> Không áp dụng gì cả (viền = 0).
            !frameSource && styles.classicBorder
        ]}>
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.placeholder, { backgroundColor: theme.colors.background }]}>
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

            {/* LAYER 1: AVATAR USER */}
            <View style={styles.centerLayer}>
                {renderAvatarContent()}
            </View>

            {/* LAYER 2: KHUNG ẢNH (Chỉ render nếu có source) */}
            {frameSource && (
                <Image
                    source={frameSource}
                    style={[styles.frameImage, { width: size, height: size }]}
                    resizeMode="contain"
                />
            )}

            {/* LAYER 3: BADGE */}
            {children && (
                <View style={styles.badgeContainer}>
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 10,
    },
    centerLayer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    avatarContainer: {
        overflow: 'hidden',
        backgroundColor: 'white', // Nền trắng để lót ảnh nếu ảnh user trong suốt
        // Mặc định không có border ở đây
    },
    // Style này CHỈ áp dụng khi không có khung
    classicBorder: {
        borderWidth: 1,
        borderColor: 'white',

        // Shadow giúp avatar nổi lên nền khi không có khung
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    },
    placeholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    frameImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    badgeContainer: {
        position: 'absolute',
        bottom: -30,
        zIndex: 999,
        elevation: 20,
    },
});

export default UserAvatar;