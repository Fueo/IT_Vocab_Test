// app/index.tsx
import { authApi } from "@/api/auth"; // ✅ Import authApi có sẵn
import { firstLaunchStore } from "@/storage/firstLaunch";
import { tokenStore } from "@/storage/token"; // Import để clear nếu lỗi
import { Href, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function Index() {
    const [ready, setReady] = useState(false);
    const [href, setHref] = useState<Href>("/welcome");

    useEffect(() => {
        (async () => {
            // 1. Check màn hình Welcome (First Launch)
            const hasSeen = await firstLaunchStore.hasSeenWelcome();
            if (!hasSeen) {
                setHref("/welcome");
                setReady(true);
                return;
            }

            // 2. Thử Refresh Token bằng hàm có sẵn trong auth.ts
            try {
                // Hàm này sẽ:
                // - Tự check xem có refresh token trong máy không (nếu không -> throw Error)
                // - Gọi API lấy token mới
                // - Tự lưu token mới vào Store (tokenStore.setTokens)
                await authApi.refresh();

                // Nếu chạy đến đây tức là ngon lành -> Vào App
                setHref("/tabs/quiz");
            } catch (error) {
                // Rơi vào đây nếu:
                // - Không có refresh token trong máy (User chưa đăng nhập)
                // - Hoặc refresh token hết hạn/không hợp lệ
                // - Hoặc lỗi mạng/server

                // Cẩn thận: Clear sạch token cũ để tránh rác
                await tokenStore.clearTokens();

                // Điều hướng về Login
                setHref("/auth/login");
            } finally {
                setReady(true);
            }
        })();
    }, []);

    if (!ready) return null;

    return <Redirect href={href} />;
}