import { Ionicons } from '@expo/vector-icons';
import React from 'react';

interface TabBarIconProps {
    focused: boolean;
    color: string;
    name: keyof typeof Ionicons.glyphMap; // Tên icon gốc (ví dụ: 'home', 'person')
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, color, name }) => {
    // Nếu focus thì dùng tên gốc, nếu không thì thêm '-outline'
    // Lưu ý: Cần đảm bảo icon có phiên bản outline tương ứng trong Ionicons
    const iconName = focused ? name : `${name}-outline` as keyof typeof Ionicons.glyphMap;

    return (
        <Ionicons
            name={iconName}
            size={24}
            color={color}
            style={{ marginBottom: -3 }} // Hack nhỏ để căn chỉnh icon đẹp hơn trên iOS
        />
    );
};

export default TabBarIcon;