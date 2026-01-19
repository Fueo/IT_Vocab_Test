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
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else setEmailError("");

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length <= 6) {
      setPasswordError("Password must be longer than 6 characters");
      isValid = false;
    } else setPasswordError("");

    return isValid;
  };

  // email/password login
  const handleLogin = async (): Promise<void> => {
    if (isBusy) return;
    if (!validateInputs()) return;

    setPendingLogin(true);
    try {
      await authApi.login({ email, password });

      openDialog({
        type: "success",
        title: "Login successful",
        message: "Welcome back!",
        closeText: "Continue",
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Login thất bại. Vui lòng thử lại.";
      openDialog({
        type: "error",
        title: "Login failed",
        message: msg,
        closeText: "Try Again",
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
        title: "Google Login",
        message: "Chức năng đang bảo trì (Logic đã được xóa tạm thời).",
        closeText: "Đóng"
    });
  };

  // ✅ Placeholder cho Facebook Login (UI only)
  const handleFacebookLogin = async () => {
    if (isBusy) return;
    console.log("Facebook login pressed - Logic removed");
    openDialog({
        type: "info",
        title: "Facebook Login",
        message: "Chức năng đang bảo trì (Logic đã được xóa tạm thời).",
        closeText: "Đóng"
    });
  };

  const handleForgetPassword = () => router.push("/auth/forgetpassword");
  const handleNavigateRegister = () => router.push("/auth/register");

  const handleGuestLogin = () => {
    if (isBusy) return;

    openDialog({
      type: "confirm",
      title: "Continue as Guest?",
      message: "You can try the app without an account.",
      closeText: "Cancel",
      confirmText: "Start",
      onConfirm: async () => {
        closeDialog();
        setPendingGuest(true);
        try {
          await ensureGuestKey();
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
              Welcome Back!
            </AppText>
            <AppText size="sm" color="rgba(255,255,255,0.8)">
              Log in to continue your learning journey
            </AppText>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <AppInput
            label="Email"
            placeholder="your.email@fpt.edu.vn"
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
            label="Password"
            placeholder="Enter your password"
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
              Forgot password?
            </AppText>
          </TouchableOpacity>

          <AppButton
            title="Log In"
            onPress={handleLogin}
            variant="primary"
            style={styles.loginBtn}
            disabled={isBusy}
            isLoading={pendingLogin}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <AppText size="sm" color={theme.colors.text.secondary} style={styles.orText}>
              OR
            </AppText>
            <View style={styles.line} />
          </View>

          {/* UI Nút Google: Giữ nguyên hiển thị, xóa logic disable/loading */}
          <AppButton
            title="Continue with Google"
            variant="google"
            onPress={handleGoogleLogin}
            style={styles.socialBtn}
            disabled={isBusy}
          />

          {/* UI Nút Facebook: Giữ nguyên hiển thị */}
          <AppButton
            title="Continue with Facebook"
            variant="outline"
            icon="logo-facebook"
            onPress={handleFacebookLogin}
            style={styles.socialBtn}
            disabled={isBusy}
          />

          <View style={styles.footerRow}>
            <AppText size="sm" color={theme.colors.text.secondary}>
              Don't have an account?
            </AppText>
            <TouchableOpacity onPress={handleNavigateRegister} disabled={isBusy}>
              <AppText
                size="sm"
                color={theme.colors.secondary}
                weight="bold"
                style={{ marginLeft: theme.spacing.xs }}
              >
                Sign Up
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={[styles.dividerContainer, { marginTop: theme.spacing.lg }]}>
            <View style={styles.line} />
            <AppText size="xs" color={theme.colors.text.secondary} style={styles.orText}>
              Quick Start
            </AppText>
            <View style={styles.line} />
          </View>

          <AppButton
            title="Continue as Guest"
            variant="outline"
            icon="person"
            onPress={handleGuestLogin}
            style={styles.guestBtn}
            disabled={isBusy}
            isLoading={pendingGuest}
          />

          <AppText size="xs" color={theme.colors.text.secondary} centered style={styles.guestSubText}>
            Try the app without creating an account
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