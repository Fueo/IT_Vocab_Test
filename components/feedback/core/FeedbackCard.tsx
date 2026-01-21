import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FeedbackItemDto, FeedbackStatus } from '../../../api/feedback';
import theme from '../../../theme'; // Import từ index.ts chứa đầy đủ config
import { AppText } from '../../core';

interface FeedbackCardProps {
  item: FeedbackItemDto;
  onPress: () => void;
  onDelete: () => void;
}

const getStatusColor = (status: FeedbackStatus) => {
  switch (status) {
    case 'resolved': return theme.colors.success; // Sử dụng màu success từ colors.ts
    case 'closed': return theme.colors.text.lightGrey; // Sử dụng màu xám nhạt
    case 'open': 
    default: return theme.colors.primary; // Màu xanh chủ đạo
  }
};

const getStatusLabel = (status: FeedbackStatus) => {
  switch (status) {
    case 'resolved': return 'Đã xử lý';
    case 'closed': return 'Đã đóng';
    case 'open': return 'Đang chờ';
    case 'pending': return 'Đang xử lý';
    default: return status;
  }
};

const FeedbackCard: React.FC<FeedbackCardProps> = ({ item, onPress, onDelete }) => {
  const statusColor = getStatusColor(item.status);
  
  // Format ngày tháng
  const dateStr = new Date(item.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: statusColor + '15' }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <AppText size="xs" weight="bold" color={statusColor}>
            {getStatusLabel(item.status)}
          </AppText>
        </View>
        
        <AppText size="xs" color={theme.colors.text.secondary}>
          {dateStr}
        </AppText>
      </View>

      <View style={styles.content}>
        <AppText size="md" weight="bold" numberOfLines={1} style={styles.title}>
          {item.title}
        </AppText>
        <AppText size="sm" color={theme.colors.text.secondary} numberOfLines={2}>
          {item.content}
        </AppText>
      </View>

      <View style={styles.footer}>
        <AppText size="xs" color={theme.colors.text.secondary}>
           Lý do: {item.reason}
        </AppText>

        {/* Backend: Chỉ được xoá khi status = 'open' */}
        {item.status === 'open' && (
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={(e) => {
              e.stopPropagation(); // Ngăn chặn click vào card
              onDelete();
            }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground, // Sửa: dùng cardBackground từ colors.ts
    borderRadius: theme.radius.md,              // Sửa: dùng radius.md từ radius.ts
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    
    // Shadow
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm, // Dùng spacing chuẩn (8)
    paddingVertical: 4,
    borderRadius: theme.radius.md, // Bo góc badge
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  content: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: 4,
    color: theme.colors.text.primary, // Đảm bảo màu chữ chính xác
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.smd, // Tăng padding top chút cho thoáng (12)
    borderTopWidth: 1,
    borderTopColor: theme.colors.border, // Dùng màu border thay vì background
  },
  deleteBtn: {
    padding: 4,
  }
});

export default FeedbackCard;