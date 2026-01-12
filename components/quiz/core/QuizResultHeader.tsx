import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../../theme';
import { AppText } from '../../core';

interface ResultHeaderProps {
    score: number; // Số câu đúng
    total: number;
    title: string; // VD: "Excellent Job!"
    subtitle: string; // VD: "You mastered this topic!"
    iconSource: any; // Ảnh minh họa (cúp hoặc tay cơ bắp)
}

const ResultHeader: React.FC<ResultHeaderProps> = ({
    title,
    subtitle,
    iconSource
}) => {
    return (
        <View style={styles.container}>
            {/* Vòng tròn nền Icon */}
            <LinearGradient
                colors={['#FF9966', '#FF5E62']} // Cam -> Đỏ (hoặc Xanh nếu thắng)
                style={styles.iconCircle}
            >
                {/* Ở đây dùng Image thay vì Ionicons để hiển thị ảnh 3D đẹp như mẫu */}
                {/* Tạm thời dùng icon emoji text demo, bạn thay bằng Image thật nhé */}
                <AppText size="huge" style={{ fontSize: 50 }}>💪</AppText>
            </LinearGradient>

            <AppText size="title" weight="bold" color={theme.colors.text.primary} style={styles.title}>
                {title}
            </AppText>

            <AppText
                size="sm"
                color={theme.colors.text.secondary}
                centered // [THÊM] Thuộc tính này để căn giữa chữ
                style={{ paddingHorizontal: 20 }} // Thêm padding để chữ không sát lề nếu dài quá
            >
                {subtitle}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        // Shadow
        shadowColor: '#FF5E62',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        marginBottom: 4,
    }
});

export default ResultHeader;