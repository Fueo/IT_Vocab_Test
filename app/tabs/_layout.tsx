import React, { useEffect } from "react";
import MainTabNavigator from "../../components/navigation/MainTabNavigator";
import { tokenStore } from "../../storage/token"; // ✅ Import tokenStore
import { fetchProfile } from "../../store/profileActions"; // ✅ Import hàm fetchProfile standalone của bạn

export default function TabLayout() {
  useEffect(() => {
    const initData = async () => {
      // 1. Kiểm tra token trong storage
      const token = await tokenStore.getAccessToken();

      // 2. Nếu có token thì mới gọi API lấy profile
      if (token) {
        console.log("Token found, fetching profile...");
        // Gọi hàm trực tiếp, không cần dispatch
        // Bạn có thể truyền { silent: true } nếu muốn không hiện loading toàn màn hình
        fetchProfile({ silent: true }).catch(err => {
            console.log("Failed to fetch profile in background", err);
        });
      } else {
        console.log("No token, skipping profile fetch");
      }
    };

    initData();
  }, []);

  return <MainTabNavigator />;
}