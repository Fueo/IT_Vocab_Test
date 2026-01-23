// app/_layout.tsx
import theme from "@/theme";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import AppDialog from "@/components/core/AppDialog"; // ✅ sửa path theo project bạn
import { onAuthExpired } from "@/lib/authEvents";
import { tokenStore } from "@/storage/token"; // ✅ sửa path theo project bạn

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  // ✅ dialog state
  const [authDialogVisible, setAuthDialogVisible] = useState(false);
  const [authDialogMsg, setAuthDialogMsg] = useState<string>(
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
  );
  const showingRef = useRef(false);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // ✅ nghe event auth expired -> mở dialog
  useEffect(() => {
    const off = onAuthExpired((msg) => {
      // chống mở nhiều lần
      if (showingRef.current) return;
      showingRef.current = true;

      setAuthDialogMsg(msg || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setAuthDialogVisible(true);
    });

    return off;
  }, []);

  if (!loaded && !error) return null;

  const statusBarHeight = Constants.statusBarHeight;

  async function handleReLogin() {
    // đóng dialog trước
    setAuthDialogVisible(false);
    showingRef.current = false;

    // clear token + điều hướng về login
    await tokenStore.clearTokens();
    router.replace("/auth/login");
  }

  function handleCloseDialog() {
    // Bạn có thể bắt buộc user phải login lại: không cho đóng -> bỏ nút close
    // Nhưng với component hiện tại cần onClose, mình cho đóng và vẫn đá về login.
    setAuthDialogVisible(false);
    showingRef.current = false;
    router.replace("/auth/login");
  }

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="game/[id]" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="dictionary/[id]" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="feedback/homepage" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>

      {/* overlay status bar */}
      <View
        pointerEvents="none"
        style={{
          height: statusBarHeight,
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      />

      {/* ✅ AppDialog thay Alert */}
      <AppDialog
        visible={authDialogVisible}
        type="confirm"
        title="Hết phiên đăng nhập"
        message={authDialogMsg}
        closeText="Để sau"
        confirmText="Đăng nhập lại"
        isDestructive={false}
        onClose={handleCloseDialog}
        onConfirm={handleReLogin}
        onlyConfirm={true}
      />
    </>
  );
}
