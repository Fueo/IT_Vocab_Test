import theme from '@/theme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
// Giữ màn hình splash visible cho đến khi font load xong (optional nhưng khuyên dùng)
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

  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor={theme.colors.background} // Màu nền (chỉ tác dụng Android)
        translucent={false} // false: Nội dung nằm DƯỚI status bar (không bị chìm)
      />
      <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen
          name="course/[id]"
          options={{
            headerShown: false, // Ẩn header native vì mình đã có CourseHeader
            presentation: 'card' // Kiểu hiển thị card tiêu chuẩn
          }}
        />

        <Stack.Screen
          name="game/[id]"
          options={{
            headerShown: false,
            gestureEnabled: false // Tắt vuốt lui để bắt buộc dùng nút X
          }}
        />
      </Stack>
    </>
  );
}