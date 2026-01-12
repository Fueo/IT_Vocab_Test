const colors = {
    // Nền trắng như trong ảnh
    background: '#FFFFFF',

    // Màu xanh lá chủ đạo (Lấy từ nút Next và Active Dot)
    primary: '#5BC236',
    primaryLight: 'rgba(91, 194, 54, 0.15)',
    // Màu phụ (Dùng cho phần dưới của Gradient icon: Xanh dương)
    secondary: '#28B9D6',

    // Màu gradient bắt đầu (Xanh lá nhạt hơn ở icon)
    gradientStart: '#4ED968',
    // Màu gradient kết thúc (Xanh dương ở icon)
    gradientEnd: '#28B9D6',

    // Màu nền card (nếu có dùng card nổi trên nền trắng)
    cardBackground: '#F5F5F5',

    // Màu nền nút (Trùng với primary hoặc tối hơn chút khi nhấn)
    buttonBackground: '#5BC236',

    // Màu cho các chấm dot slide
    dotActive: '#5BC236',
    dotInactive: '#E0E0E0',

    text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        white: '#FFFFFF',
        black: '#000000',
        lightGrey: '#8E8E93', // Thêm màu này cho nút Skip
    },

    slides: {
        step1: ['#4CD964', '#28B9D6'],
        step2: ['#FF9500', '#FFCC00'],
        step3: ['#9C27B0', '#E91E63'],
    },

    success: '#22C55E', // Giữ nguyên màu xanh success chuẩn
    error: '#FB7181',   // Giữ nguyên
    border: '#E5E7EB',  // Màu viền nhạt cho light mode
};

export default colors;