import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../theme';

interface PaginatorProps {
    data: any[];
    currentIndex: number;
    activeColor?: string;
}

const Paginator: React.FC<PaginatorProps> = ({
    data,
    currentIndex,
    activeColor = theme.colors.primary
}) => {
    return (
        <View style={styles.container}>
            {data.map((_, index) => {
                const isActive = currentIndex === index;
                return (
                    <View
                        key={index.toString()}
                        style={[
                            styles.dot,
                            isActive && {
                                width: 24, // Kéo dài dot active
                                backgroundColor: activeColor
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 20, // Cố định chiều cao để không bị nhảy layout
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    dot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 4,
    },
});

export default Paginator;