import { emitAuthExpired } from "@/lib/authEvents";
import { guestStore } from "@/storage/guest";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Tokens, tokenStore } from "../storage/token";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  // ✅ KHÔNG set Content-Type global (để tự động theo từng request)
});

// helper: detect FormData (RN/Expo ok)
function isFormData(data: any) {
  return (data && typeof data === 'object' && data.constructor && data.constructor.name === 'FormData');
}

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.getAccessToken();
  const guestKey = await guestStore.get();

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (guestKey) config.headers["x-guest-key"] = guestKey;

  const isFD =
    config.data &&
    typeof config.data === "object" &&
    config.data.constructor?.name === "FormData";

  if (isFD) {
    // quan trọng: xóa hết content-type để axios/native tự set boundary
    delete (config.headers as any)["Content-Type"];
    delete (config.headers as any)["content-type"];
  } else {
    // chỉ set JSON nếu chưa có
    if (!(config.headers as any)["Content-Type"] && !(config.headers as any)["content-type"]) {
      (config.headers as any)["Content-Type"] = "application/json";
    }
  }

  return config;
});

type QueuedReq = (newAccessToken: string | null) => void;

let isRefreshing = false;
let queue: QueuedReq[] = [];

function resolveQueue(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

// ✅ thêm: đếm fail + chống spam dialog
let refreshFailCount = 0;
let lastEmitAt = 0;
function notifyLoginAgain(msg?: string) {
  const now = Date.now();
  if (now - lastEmitAt < 5000) return; // max 1 lần / 5s
  lastEmitAt = now;
  emitAuthExpired(msg || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError<any>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (original._retry) return Promise.reject(error);
    original._retry = true;

    // ✅ Nếu chính refresh bị 401 => logout ngay + notify
    if (String(original.url || "").includes("/auth/refresh")) {
      await tokenStore.clearTokens();
      resolveQueue(null);
      notifyLoginAgain("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return Promise.reject(error);
    }

    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) {
      await tokenStore.clearTokens();
      resolveQueue(null);
      notifyLoginAgain("Vui lòng đăng nhập lại.");
      return Promise.reject(error);
    }

    // đang refresh -> chờ
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
      const resp = await axios.post<Tokens>(
        `${baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const tokens = resp.data;
      await tokenStore.setTokens(tokens);

      // ✅ refresh ok => reset fail count
      refreshFailCount = 0;

      resolveQueue(tokens.accessToken);

      original.headers.Authorization = `Bearer ${tokens.accessToken}`;

      // ✅ QUAN TRỌNG: nếu original là FormData thì cũng xóa Content-Type trước khi retry
      if (isFormData(original.data)) {
        delete (original.headers as any)["Content-Type"];
        delete (original.headers as any)["content-type"];
      }

      return api(original);
    } catch (e) {
      resolveQueue(null);
      await tokenStore.clearTokens();

      refreshFailCount += 1;
      if (refreshFailCount >= 2) {
        notifyLoginAgain("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        refreshFailCount = 0;
      }

      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
