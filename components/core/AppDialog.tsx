import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import theme from '../../theme'; // Import theme của bạn
import AppButton from './AppButton';
import AppText from './AppText';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AppDialogProps {
    visible: boolean;
    type?: DialogType; // Mặc định là 'info'
    title: string;
    message?: string;

    // --- Actions ---
    onClose: () => void;      // Hành động đóng (hoặc nút Cancel)
    onConfirm?: () => void;   // Hành động xác nhận (chỉ dùng cho type='confirm')

    // --- Custom Labels ---
    closeText?: string;       // Text cho nút đóng (mặc định "Close" hoặc "Cancel")
    confirmText?: string;     // Text cho nút xác nhận (mặc định "Confirm")

    // --- Tùy chỉnh nâng cao ---
    isDestructive?: boolean;  // Nếu true, nút Confirm sẽ màu đỏ (dùng cho Xóa/Logout)
}

const AppDialog: React.FC<AppDialogProps> = ({
    visible,
    type = 'info',
    title,
    message,
    onClose,
    onConfirm,
    closeText,
    confirmText = "Confirm",
    isDestructive = false,
}) => {

    // 1. Cấu hình giao diện dựa trên `type`
    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle-outline', // ✅ tồn tại
                    color: theme.colors.success, // Xanh lá
                    bgColor: 'rgba(34, 197, 94, 0.1)',
                    defaultBtn: 'Great!',
                };

            case 'error':
                return {
                    icon: 'alert-circle', // ✅ tồn tại
                    color: theme.colors.error, // Đỏ
                    bgColor: '#FEF2F2',
                    defaultBtn: 'Try Again',
                };

            case 'warning':
                return {
                    icon: 'warning-outline', // ✅ tồn tại
                    color: theme.colors.warning || '#F59E0B',
                    bgColor: '#FFFBEB',
                    defaultBtn: 'Understood',
                };

            case 'confirm':
                return {
                    icon: 'help-sharp', // ✅ tồn tại
                    color: isDestructive
                        ? theme.colors.error
                        : theme.colors.primary,
                    bgColor: isDestructive
                        ? '#FEF2F2'
                        : 'rgba(91, 194, 54, 0.1)',
                    defaultBtn: 'Confirm',
                };

            case 'info':
            default:
                return {
                    icon: 'information-circle-outline', // ✅ tồn tại
                    color: theme.colors.primary,
                    bgColor: 'rgba(91, 194, 54, 0.1)',
                    defaultBtn: 'OK',
                };
        }
    };

    const config = getConfig();
    const finalCloseText = closeText || (type === 'confirm' ? 'Cancel' : config.defaultBtn);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose} // Android hardware back button
        >
            {/* Lớp nền mờ */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>

                    {/* Nội dung Dialog (Chặn click xuyên qua) */}
                    <TouchableWithoutFeedback>
                        <View style={styles.dialogContainer}>

                            {/* 1. Icon Circle */}
                            <View style={[styles.iconCircle, { backgroundColor: config.bgColor }]}>
                                <Ionicons
                                    name={config.icon as any}
                                    size={36}
                                    color={config.color}
                                />
                            </View>

                            {/* 2. Text Content */}
                            <View style={styles.textContainer}>
                                <AppText size="lg" weight="bold" centered style={{ marginBottom: 8 }} color={theme.colors.text.primary}>
                                    {title}
                                </AppText>
                                {message && (
                                    <AppText size="md" color={theme.colors.text.secondary} centered style={{ lineHeight: 22 }}>
                                        {message}
                                    </AppText>
                                )}
                            </View>

                            {/* 3. Action Buttons */}
                            <View style={styles.buttonRow}>
                                {type === 'confirm' ? (
                                    // --- LAYOUT 2 NÚT (Confirm Type) ---
                                    <>
                                        <View style={styles.buttonWrapper}>
                                            <AppButton
                                                title={finalCloseText}
                                                onPress={onClose}
                                                variant="outline"
                                                style={{ marginBottom: 0 }}
                                            />
                                        </View>
                                        <View style={{ width: 12 }} />
                                        <View style={styles.buttonWrapper}>
                                            <AppButton
                                                title={confirmText}
                                                onPress={onConfirm}
                                                variant="primary"
                                                // Nếu là hành động nguy hiểm, đổi màu nút thành đỏ
                                                style={[
                                                    { marginBottom: 0 },
                                                    isDestructive && { backgroundColor: theme.colors.error, borderColor: theme.colors.error }
                                                ]}
                                            />
                                        </View>
                                    </>
                                ) : (
                                    // --- LAYOUT 1 NÚT (Success/Error/Info) ---
                                    <View style={[styles.buttonWrapper, { flex: 0, width: '100%' }]}>
                                        <AppButton
                                            title={finalCloseText}
                                            onPress={onClose}
                                            variant="primary"
                                            style={[{ marginBottom: 0 }, { backgroundColor: config.color, borderColor: config.color }]}
                                        />
                                    </View>
                                )}
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    dialogContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: 'white',
        borderRadius: theme.radius.xl, // 30
        padding: theme.spacing.lg,
        alignItems: 'center',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    textContainer: {
        marginBottom: theme.spacing.xl,
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    buttonWrapper: {
        flex: 1,
    }
});

export default AppDialog;