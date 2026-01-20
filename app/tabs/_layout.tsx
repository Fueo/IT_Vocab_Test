import React, { useEffect } from "react";
import MainTabNavigator from "../../components/navigation/MainTabNavigator";
import { fetchProfile } from "../../store/profileActions";

export default function TabLayout() {
  useEffect(() => {
    fetchProfile(); // ✅ gọi 1 lần khi vào tabs
  }, []);

  return <MainTabNavigator />;
}
