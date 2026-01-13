import theme from '@/theme';
import Constants from 'expo-constants'; // Import Constants để lấy chiều cao
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar'; // Import StatusBar từ expo
import { useEffect } from 'react';
import { View } from 'react-native'; // Import View

// Giữ màn hình splash visible cho đến khi font load xong
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  // Lấy chiều cao status bar của thiết bị
  const statusBarHeight = Constants.statusBarHeight;

  return (
    <>
      {/* 1. Cấu hình Status Bar thật: Trong suốt hoàn toàn, chữ màu trắng (light) */}
      <StatusBar
        style="light"
        translucent={true}
        backgroundColor="transparent"
      />

      {/* 2. Stack Navigation chứa nội dung ứng dụng */}
      <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen
          name="course/[id]"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="game/[id]"
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="dictionary/[id]"
          options={{
            headerShown: false,
            gestureEnabled: false
          }}
        />
      </Stack>

      {/* 3. Lớp phủ (Overlay) giả làm nền Status Bar */}
      <View
        pointerEvents="none" // Quan trọng: Để cho phép chạm xuyên qua (không chặn thao tác vuốt status bar của iOS)
        style={{
          height: statusBarHeight, // Chiều cao tự động theo tai thỏ/màn hình
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Màu đen mờ (chỉnh 0.3 đậm nhạt tùy ý)
          position: 'absolute', // Nằm đè lên
          top: 0,
          left: 0,
          zIndex: 9999, // Đảm bảo luôn nằm trên cùng
        }}
      />
    </>
  );
}