import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Import View chính và Theme
import DictionaryDetailView, { DictionaryDetailData } from '../../components/dictionary/DictionaryDetailView';
import theme from '../../theme';

const DictionaryDetailScreen = () => {
    // Lấy ID từ URL nếu cần gọi API chi tiết
    const params = useLocalSearchParams();

    // CHUẨN HÓA DỮ LIỆU TỪ PARAMS
    const wordData: DictionaryDetailData = {
        id: (params.id as string) || '',
        term: (params.term as string) || '',
        phonetic: (params.phonetic as string) || '',
        category: (params.category as string) || '',
        level: (params.level as string) || '',
        definition: (params.definition as string) || '',
        example: (params.example as string) || '',
        notes: (params.notes as string) || '', // Đảm bảo notes không bao giờ bị undefined
    };

    return (
        <View style={styles.container}>
            {/* Đảm bảo StatusBar chữ tối để tương phản tốt với nền trắng của Header */}
            <StatusBar style="dark" />

            {/* View chính chứa toàn bộ logic hiển thị và dữ liệu */}
            <DictionaryDetailView
                data={wordData}
                onSaveNote={(id, note) => console.log(id, note)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background, // Sử dụng màu nền từ theme
    },
});

export default DictionaryDetailScreen;