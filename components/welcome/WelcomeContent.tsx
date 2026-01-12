import React from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import theme from '../../theme'; // Import theme (lùi 2 cấp thư mục)

const WelcomeContent = () => {
    return (
        <View style={styles.container}>
            {/* Ẩn thanh status bar hoặc chỉnh màu cho đẹp */}
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

            <View style={styles.logoContainer}>
                <Image
                    // Lưu ý: Cập nhật đường dẫn ảnh tùy theo cấu trúc folder của bạn
                    // Thường là lùi ra khỏi components -> src -> media
                    source={require('../../media/logo_auth.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background, // Màu nền đen (#0c0f14)
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        // Có thể thêm hiệu ứng animation sau này tại đây
    },
    logo: {
        width: 150,
        height: 150,
    }
});

export default WelcomeContent;