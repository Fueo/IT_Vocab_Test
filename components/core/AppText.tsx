import React, { memo } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import theme from '../../theme'; // Đảm bảo đường dẫn này đúng với cấu trúc dự án của bạn

export interface AppTextProps extends TextProps {
    children?: React.ReactNode;
    size?: keyof typeof theme.fontSizes;
    weight?: keyof typeof theme.fonts;
    color?: string;
    style?: StyleProp<TextStyle>;
    centered?: boolean;
}

const AppText: React.FC<AppTextProps> = ({
    children,
    size = 'md',
    weight = 'regular',
    color = theme.colors.text.white,
    style,
    centered,
    ...props
}) => {
    return (
        <Text
            style={[
                {
                    fontSize: theme.fontSizes[size],
                    fontFamily: theme.fonts[weight],
                    color: color,
                    textAlign: centered ? 'center' : 'left',
                },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

export default memo(AppText);