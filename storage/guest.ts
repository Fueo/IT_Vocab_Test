import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_KEY = "x_guest_key";

export const guestStore = {
  get(): Promise<string | null> {
    return AsyncStorage.getItem(GUEST_KEY);
  },
  set(key: string): Promise<void> {
    return AsyncStorage.setItem(GUEST_KEY, key);
  },
  clear(): Promise<void> {
    return AsyncStorage.removeItem(GUEST_KEY);
  },
};
