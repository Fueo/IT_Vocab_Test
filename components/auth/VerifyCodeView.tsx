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

import { authApi } from "../../api/auth";

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

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);

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
      openDialog({ type: "error", title: "Missing Email", message: "Please go back and register again.", closeText: "OK", onCloseGoBack: true });
      return;
    }
    if (code.length !== CODE_LENGTH) return;

    setIsVerifying(true);
    try {
      await authApi.verifyCode({ email, purpose: "signup", code });

      openDialog({
        type: "success",
        title: "Verified!",
        message: "Your email has been verified. You can log in now.",
        closeText: "Go to Login",
        onCloseGoBack: false,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "OTP not correct.";
      openDialog({
        type: "error",
        title: "Verification Failed",
        message: msg,
        closeText: "Try Again",
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
      await authApi.sendCode({ email, purpose: "signup" });
      setTimer(30);

      openDialog({
        type: "success",
        title: "Code Sent",
        message: "We sent a new verification code to your email.",
        closeText: "OK",
        onCloseGoBack: false,
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Cannot resend code.";
      openDialog({
        type: "error",
        title: "Resend Failed",
        message: msg,
        closeText: "OK",
        onCloseGoBack: false,
      });
    } finally {
      setIsResending(false);
    }
  };

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
      <AppHeader title="Verification" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={styles.content} onPress={Keyboard.dismiss}>
          <View style={styles.headerText}>
            <AppText size="lg" weight="bold" centered style={{ marginBottom: 8 }}>
              Enter Verification Code
            </AppText>
            <AppText size="md" color={theme.colors.text.secondary} centered>
              We have sent a code to{" "}
              <AppText weight="bold" color={theme.colors.text.primary}>
                {email || "your email"}
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
                Resend code in{" "}
                <AppText weight="bold" color={theme.colors.primary}>
                  {timer}s
                </AppText>
              </AppText>
            ) : (
              <AppButton
                title="Resend Code"
                variant="link"
                onPress={handleResend}
                disabled={isResending}
                isLoading={isResending}
                style={{ marginTop: 0, width: "100%" }}
              />
            )}
          </View>

          <AppButton
            title="Verify"
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
        closeText={dialog.closeText || "OK"}
        onClose={() => {
          const isSuccess = dialog.type === "success" && dialog.title === "Verified!";
          const shouldGoBack = dialog.onCloseGoBack;

          closeDialog();

          if (shouldGoBack) {
            router.replace("/auth/register" as any);
            return;
          }

          if (isSuccess) {
            router.replace("/auth/login" as any);
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
