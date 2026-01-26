import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import theme from "../../theme";
import { AppButton, AppInput, AppText } from "../core";
import AppDialog, { DialogType } from "../core/AppDialog";

import { guestStore } from "@/storage/guest";
import { tokenStore } from "@/storage/token";
import { useProfileStore } from "@/store/useProfileStore";
import { authApi } from "../../api/auth";
import { ensureGuestKey } from "../../utils/guest";

const { height } = Dimensions.get("window");

type DialogState = {
  visible: boolean;
  type: DialogType;
  title: string;
  message?: string;
  onConfirm?: (() => void) | undefined;
  confirmText?: string;
  closeText?: string;
  isDestructive?: boolean;
};

const LoginView: React.FC = () => {
  // form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // pending
  const [pendingLogin, setPendingLogin] = useState<boolean>(false);
  const [pendingGuest, setPendingGuest] = useState<boolean>(false);

  // Đã xóa state pendingGoogle/Facebook
  const isBusy = pendingLogin || pendingGuest;

  // dialog
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const clearAuthState = async () => {
    // 1. clear profile/user state
    useProfileStore.getState().clear();
    // 2. clear guest
    try {
      // nếu không có guestStore thì bỏ dòng này
      await guestStore.clear?.();
    } catch { }

    // 3. clear token
    try {
      // đổi theo tokenStore của bạn: clear(), reset(), removeTokens()...
      await tokenStore.clearTokens?.();
    } catch { }
  };

  const openDialog = (next: Omit<DialogState, "visible">) => {
    setDialog({ ...next, visible: true });
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, visible: false, onConfirm: undefined }));
  };

  const onDialogClose = () => {
    const wasSuccess = dialog.type === "success";
    closeDialog();
    if (wasSuccess) router.replace("/tabs/quiz");
  };

  // validation
  const validateInputs = (): boolean => {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError("Vui lòng nhập email");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Địa chỉ email không hợp lệ");
      isValid = false;
    } else setEmailError("");

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    } else setPasswordError("");

    return isValid;
  };

  // email/password login
  const handleLogin = async (): Promise<void> => {
    if (isBusy) return;
    if (!validateInputs()) return;

    setPendingLogin(true);
    clearAuthState();
    try {
      await authApi.login({ email, password });

      openDialog({
        type: "success",
        title: "Đăng nhập thành công",
        message: "Chào mừng bạn trở lại!",
        closeText: "Tiếp tục",
      });
    } catch (e: any) {
      const msg = e?.userMessage || "Đăng nhập thất bại. Vui lòng thử lại.";
      openDialog({
        type: "error",
        title: "Đăng nhập thất bại",
        message: msg,
        closeText: "Thử lại",
      });
    } finally {
      setPendingLogin(false);
    }
  };

  // ✅ Placeholder cho Google Login (UI only)
  const handleGoogleLogin = async () => {
    if (isBusy) return;
    console.log("Google login pressed - Logic removed");
    openDialog({
      type: "info",
      title: "Đăng nhập Google",
      message: "Chức năng đang bảo trì.",
      closeText: "Đóng"
    });
  };

  // ✅ Placeholder cho Facebook Login (UI only)
  const handleFacebookLogin = async () => {
    if (isBusy) return;
    console.log("Facebook login pressed - Logic removed");
    openDialog({
      type: "info",
      title: "Đăng nhập Facebook",
      message: "Chức năng đang bảo trì.",
      closeText: "Đóng"
    });
  };

  const handleForgetPassword = () => router.push("/auth/forgetpassword");
  const handleNavigateRegister = () => router.push("/auth/register");

  const handleGuestLogin = () => {
    if (isBusy) return;

    openDialog({
      type: "confirm",
      title: "Tiếp tục với vai trò Khách?",
      message: "Bạn có thể trải nghiệm ứng dụng mà không cần tài khoản. Lưu ý: Tiến trình của bạn sẽ bị mất khi bạn thoát App hoặc đăng nhập tài khoản.",
      closeText: "Hủy",
      confirmText: "Bắt đầu",
      onConfirm: async () => {
        await clearAuthState();
        closeDialog();
        setPendingGuest(true);
        try {
          await ensureGuestKey();

          if (router.canDismiss()) {
            router.dismissAll();
          }

          router.replace("/tabs/quiz");
        } finally {
          setPendingGuest(false);
        }
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <StatusBar style="light" />

        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={styles.headerContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoCircle}>
              <Ionicons name="code-slash" size={40} color={theme.colors.gradientStart} />
            </View>
            <AppText size="title" weight="bold" style={styles.headerTitle} color="white">
              Chào mừng trở lại!
            </AppText>
            <AppText size="sm" color="rgba(255,255,255,0.8)">
              Đăng nhập để tiếp tục hành trình học tập
            </AppText>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <AppInput
            label="Email"
            placeholder="youremail@gmail.com"
            icon="mail-outline"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            error={emailError}
            style={styles.inputStyle}
            editable={!isBusy}
          />

          <AppInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu của bạn"
            icon="lock-closed-outline"
            isPassword={true}
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
            error={passwordError}
            style={styles.inputStyle}
            editable={!isBusy}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgetPassword}
            disabled={isBusy}
          >
            <AppText size="sm" color={theme.colors.secondary} weight="bold">
              Quên mật khẩu?
            </AppText>
          </TouchableOpacity>

          <AppButton
            title="Đăng Nhập"
            onPress={handleLogin}
            variant="primary"
            style={styles.loginBtn}
            disabled={isBusy}
            isLoading={pendingLogin}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <AppText size="sm" color={theme.colors.text.secondary} style={styles.orText}>
              HOẶC
            </AppText>
            <View style={styles.line} />
          </View>

          {/* UI Nút Google: Giữ nguyên hiển thị, xóa logic disable/loading */}
          <AppButton
            title="Tiếp tục với Google"
            variant="google"
            onPress={handleGoogleLogin}
            style={styles.socialBtn}
            disabled={isBusy}
          />

          {/* UI Nút Facebook: Giữ nguyên hiển thị */}
          <AppButton
            title="Tiếp tục với Facebook"
            variant="outline"
            icon="logo-facebook"
            onPress={handleFacebookLogin}
            style={styles.socialBtn}
            disabled={isBusy}
          />

          <View style={styles.footerRow}>
            <AppText size="sm" color={theme.colors.text.secondary}>
              Chưa có tài khoản?
            </AppText>
            <TouchableOpacity onPress={handleNavigateRegister} disabled={isBusy}>
              <AppText
                size="sm"
                color={theme.colors.secondary}
                weight="bold"
                style={{ marginLeft: theme.spacing.xs }}
              >
                Đăng Ký
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={[styles.dividerContainer, { marginTop: theme.spacing.lg }]}>
            <View style={styles.line} />
            <AppText size="xs" color={theme.colors.text.secondary} style={styles.orText}>
              Truy cập nhanh
            </AppText>
            <View style={styles.line} />
          </View>

          <AppButton
            title="Tiếp tục với vai trò Khách"
            variant="outline"
            icon="person"
            onPress={handleGuestLogin}
            style={styles.guestBtn}
            disabled={isBusy}
            isLoading={pendingGuest}
          />

          <AppText size="xs" color={theme.colors.text.secondary} centered style={styles.guestSubText}>
            Thử ứng dụng không cần tạo tài khoản
          </AppText>
        </View>
      </ScrollView>

      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={onDialogClose}
        onConfirm={dialog.type === "confirm" ? dialog.onConfirm : undefined}
        closeText={dialog.closeText}
        confirmText={dialog.confirmText}
        isDestructive={dialog.isDestructive}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: "white" },
  headerContainer: {
    height: height * 0.35,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  headerContent: { alignItems: "center", marginTop: theme.spacing.lg },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: "white",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: { marginBottom: theme.spacing.sm },
  formContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    minHeight: height * 0.7,
  },
  inputStyle: { backgroundColor: "#F3F4F6", borderWidth: 0 },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.lg,
    marginTop: -theme.spacing.smd,
  },
  loginBtn: { borderRadius: 30, height: 50, marginBottom: theme.spacing.lg },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: { marginHorizontal: theme.spacing.smd },
  socialBtn: { marginBottom: theme.spacing.md },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: theme.spacing.sm },
  guestBtn: { marginBottom: theme.spacing.md, marginTop: theme.spacing.smd },
  guestSubText: { marginTop: -theme.spacing.smd, marginBottom: theme.spacing.lg },
});

export default LoginView;