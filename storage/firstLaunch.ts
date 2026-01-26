import AsyncStorage from "@react-native-async-storage/async-storage";

const FIRST_LAUNCH_KEY = "has_seen_welcome";

export const firstLaunchStore = {
    async hasSeenWelcome(): Promise<boolean> {
        const v = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        return v === "1";
    },

    async markSeenWelcome(): Promise<void> {
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "1");
    },

    async reset(): Promise<void> {
        await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
    },
};
