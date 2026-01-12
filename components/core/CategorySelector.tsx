import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '.';
import theme from '../../theme';

interface CategorySelectorProps {
    categories: string[];
    selectedCategory: string;
    onSelect: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selectedCategory,
    onSelect
}) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((category, index) => {
                    const isSelected = category === selectedCategory;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onSelect(category)}
                            activeOpacity={0.7}
                            style={[
                                styles.chip,
                                isSelected ? styles.chipActive : styles.chipInactive
                            ]}
                        >
                            <AppText
                                size="sm"
                                weight="medium"
                                color={isSelected ? theme.colors.text.white : theme.colors.text.secondary}
                            >
                                {category}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg, // Để item đầu tiên và cuối cùng không bị sát mép
        paddingVertical: theme.spacing.xs,
    },
    chip: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: 20,
        marginRight: theme.spacing.sm,
        borderWidth: 1,
    },
    chipActive: {
        backgroundColor: theme.colors.primary, // Màu xanh lá khi chọn
        borderColor: theme.colors.primary,
    },
    chipInactive: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border, // Viền xám nhạt khi không chọn
    },
});

export default CategorySelector;