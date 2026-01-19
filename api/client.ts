import { guestStore } from "@/storage/guest";
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Tokens, tokenStore } from "../storage/token";

// Android emulator: http://10.0.2.2:3000
// iOS simulator: http://localhost:3000
// Máy thật: http://IP_LAN_CUA_MAY_BAN:3000
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ---- Request: gắn access token ----
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // 1) access token
  const token = await tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 2) guest key
  const guestKey = await guestStore.get();
  if (guestKey) config.headers["x-guest-key"] = guestKey;

  return config;
});

// ---- Response: auto refresh khi 401 ----
type QueuedReq = (newAccessToken: string | null) => void;

let isRefreshing = false;
let queue: QueuedReq[] = [];

function resolveQueue(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError<any>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean });

    // không có response hoặc không phải 401
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // chống lặp vô hạn
    if (original._retry) return Promise.reject(error);
    original._retry = true;

    // tránh refresh đệ quy
    if (String(original.url || "").includes("/auth/refresh")) {
      await tokenStore.clearTokens();
      return Promise.reject(error);
    }

    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) {
      await tokenStore.clearTokens();
      return Promise.reject(error);
    }

    // nếu đang refresh -> chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((newToken) => {
          if (!newToken) return reject(error);
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      // gọi refresh bằng axios "thô" để tránh recursion interceptor
      const resp = await axios.post<Tokens>(
        `${baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const tokens = resp.data;
      await tokenStore.setTokens(tokens);

      resolveQueue(tokens.accessToken);

      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(original);
    } catch (e) {
      resolveQueue(null);
      await tokenStore.clearTokens();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
