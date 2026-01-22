import React, { useEffect, useRef } from "react";
import MainTabNavigator from "../../components/navigation/MainTabNavigator";
import { tokenStore } from "../../storage/token";
import { fetchProfile } from "../../store/profileActions";

export default function TabLayout() {
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const initData = async () => {
      const token = await tokenStore.getAccessToken();
      if (token) {
        fetchProfile({ silent: true }).catch((err) => {
          console.log("Failed to fetch profile in background", err);
        });
      }
    };

    initData();
  }, []);

  return <MainTabNavigator />;
}
