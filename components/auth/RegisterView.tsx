import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { authApi } from "../../api/auth";
import theme from "../../theme";
import { AppButton, AppDialog, AppInput, AppText } from "../core";

const { height } = Dimensions.get("window");

type Errors = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type DialogType = "success" | "error" | "warning" | "info" | "confirm";
type DialogState = {
  visible: boolean;
  type: DialogType;
  title: string;
  message?: string;
  closeText?: string;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm?: (() => void) | undefined;
};

const RegisterView: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  const [errors, setErrors] = useState<Errors>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const openDialog = useCallback((next: Omit<DialogState, "visible">) => {
    setDialog({ ...next, visible: true });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false, onConfirm: undefined }));
  }, []);

  const getErrorMessage = (e: any) => {
    if (e?.userMessage) return e.userMessage;
    const serverMsg = e?.response?.data?.message;
    if (typeof serverMsg === "string" && serverMsg.trim()) return serverMsg;
    if (typeof e?.message === "string" && e.message.trim()) return e.message;
    return "Đăng ký thất bại. Vui lòng thử lại.";
  };

  const validateInputs = (): boolean => {
    let isValid = true;
    const newErrors: Errors = { fullName: "", email: "", password: "", confirmPassword: "" };

    if (!fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Địa chỉ email không hợp lệ";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
      isValid = false;
    }

    if (!isAgreed) {
      isValid = false;
      openDialog({
        type: "warning",
        title: "Yêu cầu chấp thuận",
        message: "Vui lòng đồng ý với Điều khoản & Điều kiện để tiếp tục.",
        confirmText: "Đồng ý",
        onConfirm: closeDialog,
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleClearError = (field: keyof Errors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleRegister = async () => {
    if (isRegistering) return;
    if (!validateInputs()) return;

    setIsRegistering(true);

    try {
      // 1) Register
      await authApi.register({ name: fullName, email, password });

      // 2) Send OTP for signup
      await authApi.sendCode({ email, purpose: "signup" });

      // 3) Success dialog -> Confirm -> navigate VerifyCode
      openDialog({
        type: "success",
        title: "Tạo tài khoản thành công",
        message: "Chúng tôi đã gửi mã xác thực đến email của bạn. Vui lòng xác thực để kích hoạt tài khoản.",
        confirmText: "Xác thực ngay",
        onConfirm: () => {
          closeDialog();
          router.replace({
            pathname: "/auth/verify-code" as any,
            params: { email },
          });
        },
      });
    } catch (e: any) {
      const msg = getErrorMessage(e);

      // nếu server trả lỗi liên quan email -> set vào field cho đẹp
      if (String(msg).toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
      }

      openDialog({
        type: "error",
        title: "Đăng ký thất bại",
        message: msg,
        confirmText: "Đồng ý",
        onConfirm: closeDialog,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLoginPress = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/auth/login");
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
            <AppText size="title" weight="bold" color="white" style={styles.headerTitle}>
              Tạo Tài Khoản
            </AppText>
            <AppText
              size="sm"
              color="rgba(255,255,255,0.9)"
              centered
              style={{ paddingHorizontal: theme.spacing.xxl }}
            >
              Tham gia cùng hàng ngàn sinh viên FPT Poly học tiếng Anh IT
            </AppText>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <AppInput
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            icon="person-outline"
            value={fullName}
            onChangeText={(text: string) => {
              setFullName(text);
              handleClearError("fullName");
            }}
            error={errors.fullName}
            style={styles.inputStyle}
            editable={!isRegistering}
          />

          <AppInput
            label="Email"
            placeholder="youremail@gmail.com"
            icon="mail-outline"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              handleClearError("email");
            }}
            error={errors.email}
            style={styles.inputStyle}
            editable={!isRegistering}
          />

          <AppInput
            label="Mật khẩu"
            placeholder="Ít nhất 6 ký tự"
            icon="lock-closed-outline"
            isPassword={true}
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
              handleClearError("password");
            }}
            error={errors.password}
            style={styles.inputStyle}
            editable={!isRegistering}
          />

          <AppInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            icon="lock-closed-outline"
            isPassword={true}
            value={confirmPassword}
            onChangeText={(text: string) => {
              setConfirmPassword(text);
              handleClearError("confirmPassword");
            }}
            error={errors.confirmPassword}
            style={styles.inputStyle}
            editable={!isRegistering}
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => setIsAgreed(!isAgreed)}
              style={styles.checkboxRow}
              disabled={isRegistering}
            >
              <Ionicons
                name={isAgreed ? "checkbox" : "square-outline"}
                size={24}
                color={isAgreed ? theme.colors.primary : theme.colors.text.secondary}
              />
            </TouchableOpacity>

            <View style={styles.policyTextContainer}>
              <AppText size="xs" color={theme.colors.text.secondary}>
                Tôi đồng ý với{" "}
              </AppText>

              <TouchableOpacity
                onPress={() =>
                  openDialog({
                    type: "info",
                    title: "Điều khoản & Điều kiện",
                    message: "Sắp ra mắt.",
                    confirmText: "Đồng ý",
                    onConfirm: closeDialog,
                  })
                }
                disabled={isRegistering}
              >
                <AppText size="xs" color={theme.colors.secondary} weight="bold">
                  Điều khoản & Điều kiện
                </AppText>
              </TouchableOpacity>

              <AppText size="xs" color={theme.colors.text.secondary}>
                {" "}
                và{" "}
              </AppText>

              <TouchableOpacity
                onPress={() =>
                  openDialog({
                    type: "info",
                    title: "Chính sách bảo mật",
                    message: "Sắp ra mắt.",
                    confirmText: "Đồng ý",
                    onConfirm: closeDialog,
                  })
                }
                disabled={isRegistering}
              >
                <AppText size="xs" color={theme.colors.secondary} weight="bold">
                  Chính sách bảo mật
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          <AppButton
            title="Đăng Ký"
            onPress={handleRegister}
            variant="primary"
            disabled={!isAgreed || isRegistering}
            isLoading={isRegistering}
            style={StyleSheet.flatten([
              styles.registerBtn,
              (!isAgreed || isRegistering) && { opacity: 0.6 },
            ])}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <AppText size="sm" color={theme.colors.text.secondary} style={styles.orText}>
              HOẶC
            </AppText>
            <View style={styles.line} />
          </View>

          <AppButton
            title="Tiếp tục với Google"
            variant="google"
            onPress={() => { }}
            style={styles.socialBtn}
            disabled={isRegistering}
          />
          <AppButton
            title="Tiếp tục với Facebook"
            variant="outline"
            icon="logo-facebook"
            onPress={() => { }}
            style={styles.socialBtn}
            disabled={isRegistering}
          />

          <View style={styles.footerRow}>
            <AppText size="sm" color={theme.colors.text.secondary}>
              Đã có tài khoản?
            </AppText>
            <TouchableOpacity onPress={handleLoginPress} disabled={isRegistering}>
              <AppText
                size="sm"
                color={theme.colors.secondary}
                weight="bold"
                style={{ marginLeft: theme.spacing.xs }}
              >
                Đăng Nhập
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Dialog: lỗi/success/info... */}
      <AppDialog
        visible={dialog.visible}
        type={dialog.type as any}
        title={dialog.title}
        message={dialog.message}
        closeText={dialog.closeText}
        confirmText={dialog.confirmText}
        isDestructive={dialog.isDestructive}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: "white" },
  headerContainer: {
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xxl,
  },
  headerContent: { alignItems: "center", marginTop: theme.spacing.md, width: "100%" },
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
    paddingBottom: theme.spacing.xxl,
    minHeight: height * 0.8,
  },
  inputStyle: { backgroundColor: "#F3F4F6", borderWidth: 0 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  checkboxRow: { marginRight: theme.spacing.smd },
  policyTextContainer: { flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  registerBtn: { borderRadius: 30, height: 50, marginBottom: theme.spacing.lg },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: { marginHorizontal: theme.spacing.smd },
  socialBtn: { marginBottom: theme.spacing.md },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.smd,
    marginBottom: theme.spacing.lg,
  },
});

export default RegisterView;