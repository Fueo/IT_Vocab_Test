import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import theme from '../../theme';
import AppButton from './AppButton';
import AppText from './AppText';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AppDialogProps {
    visible: boolean;
    type?: DialogType;
    title: string;
    message?: string;

    // --- Actions ---
    onClose: () => void;
    onConfirm?: () => void;

    // --- Custom Labels ---
    closeText?: string;
    confirmText?: string; // Text nút chính (OK, Confirm, Yes...)

    // --- Tùy chỉnh nâng cao ---
    isDestructive?: boolean;
}

const AppDialog: React.FC<AppDialogProps> = ({
    visible,
    type = 'info',
    title,
    message,
    onClose,
    onConfirm,
    closeText,
    confirmText, // Không set default ở đây để check được việc user có truyền hay không
    isDestructive = false,
}) => {

    // 1. Cấu hình giao diện dựa trên `type`
    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle-outline',
                    color: theme.colors.success,
                    bgColor: 'rgba(34, 197, 94, 0.1)',
                    defaultBtn: 'Great!', // Text mặc định nếu không truyền confirmText
                };
            case 'error':
                return {
                    icon: 'alert-circle',
                    color: theme.colors.error,
                    bgColor: '#FEF2F2',
                    defaultBtn: 'Try Again',
                };
            case 'warning':
                return {
                    icon: 'warning-outline',
                    color: theme.colors.warning || '#F59E0B',
                    bgColor: '#FFFBEB',
                    defaultBtn: 'Understood',
                };
            case 'confirm':
                return {
                    icon: 'help-sharp',
                    color: isDestructive ? theme.colors.error : theme.colors.primary,
                    bgColor: isDestructive ? '#FEF2F2' : 'rgba(91, 194, 54, 0.1)',
                    defaultBtn: 'Confirm',
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle-outline',
                    color: theme.colors.primary,
                    bgColor: 'rgba(91, 194, 54, 0.1)',
                    defaultBtn: 'OK',
                };
        }
    };

    const config = getConfig();

    // Logic Text nút bấm
    const isConfirmType = type === 'confirm';
    // Nút huỷ (chỉ hiện khi type=confirm)
    const cancelLabel = closeText || 'Cancel';
    // Nút chính (Confirm/OK/Great): Ưu tiên prop confirmText -> rồi mới đến default của type
    const primaryLabel = confirmText || config.defaultBtn;

    // Logic Action nút chính
    const handlePrimaryPress = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.dialogContainer}>

                            {/* 1. Icon */}
                            <View style={[styles.iconCircle, { backgroundColor: config.bgColor }]}>
                                <Ionicons
                                    name={config.icon as any}
                                    size={36}
                                    color={config.color}
                                />
                            </View>

                            {/* 2. Content */}
                            <View style={styles.textContainer}>
                                <AppText size="lg" weight="bold" centered style={{ marginBottom: 8 }} color={theme.colors.text.primary}>
                                    {title}
                                </AppText>
                                {message ? (
                                    <AppText size="md" color={theme.colors.text.secondary} centered style={{ lineHeight: 22 }}>
                                        {message}
                                    </AppText>
                                ) : null}
                            </View>

                            {/* 3. Buttons */}
                            <View style={styles.buttonRow}>
                                {isConfirmType ? (
                                    // --- LAYOUT 2 NÚT (Confirm) ---
                                    <>
                                        <View style={styles.buttonWrapper}>
                                            <AppButton
                                                title={cancelLabel}
                                                onPress={onClose}
                                                variant="outline"
                                                style={{ marginBottom: 0 }}
                                            />
                                        </View>
                                        <View style={{ width: 12 }} />
                                        <View style={styles.buttonWrapper}>
                                            <AppButton
                                                title={primaryLabel}
                                                onPress={handlePrimaryPress}
                                                variant="primary"
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
                                            title={primaryLabel} // Sẽ hiện "OK" nếu bạn truyền confirmText="OK"
                                            onPress={handlePrimaryPress} // Gọi onConfirm nếu có
                                            variant="primary"
                                            style={[
                                                { marginBottom: 0 },
                                                { backgroundColor: config.color, borderColor: config.color }
                                            ]}
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
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        alignItems: 'center',
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