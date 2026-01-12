import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import theme from '../../theme'; // Import từ file index.ts của bạn

interface AppTextProps extends TextProps {
    children: React.ReactNode;
    size?: keyof typeof theme.fontSizes; // 'xs' | 'sm' | ... | 'title'
    weight?: keyof typeof theme.fonts;   // 'regular' | 'medium' | ...
    color?: string;
    style?: TextStyle;
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
                    textAlign: centered ? 'center' : 'auto',
                },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

export default AppText;