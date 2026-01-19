import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export const tokenStore = {
  getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_KEY);
  },

  getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_KEY);
  },

  async setTokens(tokens: Tokens): Promise<void> {
    await AsyncStorage.multiSet([
      [ACCESS_KEY, tokens.accessToken],
      [REFRESH_KEY, tokens.refreshToken],
    ]);
  },

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  },
};
