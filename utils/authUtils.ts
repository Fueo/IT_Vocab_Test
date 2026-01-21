// utils/authUtils.ts
import { DialogType } from '../components/core/AppDialog'; // 👈 Import type DialogType
import { guestStore } from '../storage/guest'; // 👈 Chỉnh lại đường dẫn import đúng với project của bạn
import { tokenStore } from '../storage/token'; // 👈 Chỉnh lại đường dẫn import đúng với project của bạn

// Định nghĩa Shape của Dialog Config state để TypeScript hiểu
interface DialogState {
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
}

interface RequireAuthOptions {
    title?: string;
    message?: string;
    confirmText?: string;
}

/**
 * Hàm kiểm tra đăng nhập chung.
 * @param router Instance của router (lấy từ useRouter())
 * @param setDialogConfig Hàm setState của Dialog
 * @param onSuccess Hàm sẽ chạy nếu user ĐÃ đăng nhập (hoặc logic cần thực hiện)
 * @param options Tùy chỉnh text cho Dialog (tiêu đề, nội dung)
 */
export const requireAuth = async (
    router: any,
    setDialogConfig: React.Dispatch<React.SetStateAction<DialogState>>,
    onSuccess: () => void,
    options?: RequireAuthOptions
) => {
    // 1. Kiểm tra Token
    const token = await tokenStore.getAccessToken();

    if (token) {
        // ✅ Đã đăng nhập -> Thực hiện hành động mong muốn
        onSuccess();
    } else {
        // ❌ Chưa đăng nhập -> Hiện Dialog chặn lại
        setDialogConfig({
            visible: true,
            type: 'confirm',
            title: options?.title || 'Yêu cầu đăng nhập',
            message: options?.message || 'Bạn cần đăng nhập để sử dụng tính năng này.',
            confirmText: options?.confirmText || 'Đăng nhập',
            
            onConfirm: async () => {
                // 1. Đóng Dialog
                setDialogConfig((prev) => ({ ...prev, visible: false }));

                // 2. Clear Guest Info
                await guestStore.clear();

                // 3. Xóa stack cũ nếu được (để tránh nút Back quay lại đây)
                if (router.canDismiss()) {
                    router.dismissAll();
                }

                // 4. Chuyển trang Login
                router.replace('/auth/login');
            },
        });
    }
};