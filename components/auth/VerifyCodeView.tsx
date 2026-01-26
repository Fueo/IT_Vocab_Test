import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import theme from "../../theme";
import AppButton from "../core/AppButton";
import AppHeader from "../core/AppDetailHeader";
import AppDialog from "../core/AppDialog";
import AppText from "../core/AppText";

import { authApi, Purpose } from "../../api/auth"; // ✅ Import type Purpose

type DialogType = "success" | "error" | "warning" | "info" | "confirm";
type DialogState = {
  visible: boolean;
  type: DialogType;
  title: string;
  message?: string;
  closeText?: string;
  onCloseGoBack?: boolean;
};

const VerifyCodeView = () => {
  const params = useLocalSearchParams();
  const email = String(params.email || "");
  // ✅ 1. Lấy purpose từ params (mặc định là signup nếu thiếu)
  const purpose = (params.purpose as Purpose) || "signup";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);

  // ✅ State lưu resetToken tạm thời khi verify thành công (cho luồng forgot password)
  const [resetToken, setResetToken] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const CODE_LENGTH = 6;
  const cursorOpacity = useRef(new Animated.Value(0)).current;

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: "info",
    title: "",
  });

  const openDialog = (next: Omit<DialogState, "visible">) => setDialog({ ...next, visible: true });
  const closeDialog = () => setDialog((p) => ({ ...p, visible: false }));

  useEffect(() => {
    const blinking = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    blinking.start();
    return () => blinking.stop();
  }, [cursorOpacity]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (!email) {
      openDialog({ type: "error", title: "Thiếu Email", message: "Vui lòng quay lại và thử lại.", closeText: "Đồng ý", onCloseGoBack: true });
      return;
    }
    if (code.length !== CODE_LENGTH) return;

    setIsVerifying(true);
    try {
      // ✅ 2. Gọi API với dynamic purpose
      const res = await authApi.verifyCode({ email, purpose, code });

      // Nếu là reset password, backend sẽ trả về resetToken
      if (purpose === "reset_password" && res.resetToken) {
        setResetToken(res.resetToken);
      }

      openDialog({
        type: "success",
        title: "Xác thực thành công!",
        message: purpose === "signup"
          ? "Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay."
          : "Mã đã xác thực. Bây giờ bạn có thể đặt mật khẩu mới.",
        closeText: "Tiếp tục",
        onCloseGoBack: false,
      });

    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Mã OTP không chính xác.";
      openDialog({
        type: "error",
        title: "Xác thực thất bại",
        message: msg,
        closeText: "Thử lại",
        onCloseGoBack: false,
      });
      setCode("");
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    try {
      // ✅ 3. Resend cũng dùng dynamic purpose
      await authApi.sendCode({ email, purpose });
      setTimer(30);

      openDialog({
        type: "success",
        title: "Đã gửi mã",
        message: "Chúng tôi đã gửi mã xác thực mới đến email của bạn.",
        closeText: "Đồng ý",
        onCloseGoBack: false,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không thể gửi lại mã.";
      openDialog({
        type: "error",
        title: "Gửi lại thất bại",
        message: msg,
        closeText: "Đồng ý",
        onCloseGoBack: false,
      });
    } finally {
      setIsResending(false);
    }
  };

  // ... (renderCells giữ nguyên)
  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      const digit = code[i];
      const isFocused = i === code.length;
      cells.push(
        <View key={i} style={[styles.cell, isFocused && styles.cellFocused, digit ? styles.cellFilled : null]}>
          {digit ? (
            <AppText size="sm" weight="bold" color={theme.colors.text.primary}>
              {digit}
            </AppText>
          ) : (
            isFocused && <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
          )}
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Xác Thực" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={styles.content} onPress={Keyboard.dismiss}>
          <View style={styles.headerText}>
            <AppText size="lg" weight="bold" centered style={{ marginBottom: 8 }}>
              Nhập Mã Xác Thực
            </AppText>
            <AppText size="md" color={theme.colors.text.secondary} centered>
              {/* Có thể chỉnh text tùy purpose nếu muốn */}
              Chúng tôi đã gửi mã đến{" "}
              <AppText weight="bold" color={theme.colors.text.primary}>
                {email || "email của bạn"}
              </AppText>
            </AppText>
          </View>

          <View style={styles.inputSection}>
            <Pressable style={styles.cellContainer} onPress={() => inputRef.current?.focus()}>
              {renderCells()}
            </Pressable>

            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(text) => {
                if (/^\d*$/.test(text) && text.length <= CODE_LENGTH) {
                  setCode(text);
                  if (text.length === CODE_LENGTH) Keyboard.dismiss();
                }
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              autoFocus
              caretHidden={true}
            />
          </View>

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <AppText size="sm" color={theme.colors.text.secondary} centered>
                Gửi lại mã sau{" "}
                <AppText weight="bold" color={theme.colors.primary}>
                  {timer}s
                </AppText>
              </AppText>
            ) : (
              <AppButton
                title="Gửi Lại Mã"
                variant="link"
                onPress={handleResend}
                disabled={isResending}
                isLoading={isResending}
                style={{ marginTop: 0, width: "100%" }}
              />
            )}
          </View>

          <AppButton
            title="Xác Thực"
            onPress={handleVerify}
            isLoading={isVerifying}
            disabled={isVerifying || code.length !== CODE_LENGTH}
            variant="primary"
          />
        </Pressable>
      </KeyboardAvoidingView>

      <AppDialog
        visible={dialog.visible}
        type={dialog.type as any}
        title={dialog.title}
        message={dialog.message}
        closeText={dialog.closeText || "Đồng ý"}
        onClose={() => {
          const isSuccess = dialog.type === "success" && dialog.title === "Xác thực thành công!";
          const shouldGoBack = dialog.onCloseGoBack;

          closeDialog();

          if (shouldGoBack) {
            router.back();
            return;
          }

          // ✅ 4. Điều hướng dựa trên Purpose
          if (isSuccess) {
            if (purpose === "signup") {
              // Case 1: Đăng ký thành công -> Về Login
              router.replace("/auth/login" as any);
            } else if (purpose === "reset_password") {
              // Case 2: Reset mật khẩu -> Sang màn nhập mật khẩu mới
              // Phải truyền kèm resetToken lấy được ở bước verify
              if (resetToken) {
                router.replace({
                  pathname: "/auth/new-password",
                  params: { resetToken: resetToken }
                } as any);
              } else {
                // Fallback an toàn nếu ko có token (hiếm gặp)
                console.error("Missing resetToken");
                router.replace("/auth/login" as any);
              }
            }
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { flex: 1, padding: theme.spacing.md, paddingTop: theme.spacing.xl },
  headerText: { marginBottom: 40, paddingHorizontal: theme.spacing.md },
  inputSection: { marginBottom: 20, position: "relative", height: 60 },
  cellContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 10 },
  cell: {
    width: 45,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cellFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  cellFilled: { borderColor: theme.colors.text.primary, backgroundColor: "#F9FAFB" },
  cursor: { width: 2, height: 24, backgroundColor: theme.colors.primary, borderRadius: 1 },
  hiddenInput: { position: "absolute", width: "100%", height: "100%", opacity: 0 },
  resendContainer: { alignItems: "center", marginBottom: 30, height: 40, justifyContent: "center", width: "100%" },
});

export default VerifyCodeView;