// src/api/api.ts (or wherever you keep axios instance)
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
  timeout: 30000,
  // ✅ KHÔNG set Content-Type global (để tự động theo từng request)
});

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function isFormData(data: any) {
  return (
    data &&
    typeof data === "object" &&
    data.constructor &&
    data.constructor.name === "FormData"
  );
}

function isAuthEndpoint(url: string) {
  const u = String(url || "");
  return (
    u.includes("/auth/login") ||
    u.includes("/auth/register") ||
    u.includes("/auth/forget") ||
    u.includes("/auth/forgot") ||
    u.includes("/auth/verify") ||
    u.includes("/auth/new-password") ||
    u.includes("/auth/reset") ||
    u.includes("/auth/refresh") // refresh xử lý riêng
  );
}

function isLoginEndpoint(url: string) {
  const u = String(url || "");
  return u.includes("/auth/login");
}

/** ✅ attach message thân thiện vào error.userMessage */
function attachUserMessage(error: AxiosError<any>) {
  // Timeout
  if (error.code === "ECONNABORTED") {
    (error as any).userMessage = "Kết nối bị timeout. Vui lòng thử lại.";
    return error;
  }

  // Mất mạng / server không reachable => không có response
  if (!error.response) {
    (error as any).userMessage =
      "Không thể kết nối tới máy chủ. Vui lòng kiểm tra Internet và thử lại.";
    return error;
  }

  const status = error.response.status;
  const serverMsg = (error.response.data as any)?.message;

  // Ưu tiên message từ backend
  if (typeof serverMsg === "string" && serverMsg.trim()) {
    (error as any).userMessage = serverMsg;
    return error;
  }

  const url = String(error.config?.url || "");

  // ✅ 401 cho LOGIN => sai credentials, KHÔNG phải hết phiên
  if (status === 401 && isLoginEndpoint(url)) {
    (error as any).userMessage = "Email hoặc mật khẩu không đúng.";
    return error;
  }

  // Map theo status để tránh “Request failed with status code xxx”
  if (status === 400) (error as any).userMessage = "Dữ liệu không hợp lệ. Vui lòng thử lại.";
  else if (status === 401) (error as any).userMessage = "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
  else if (status === 403) (error as any).userMessage = "Bạn không có quyền thực hiện thao tác này.";
  else if (status === 404) (error as any).userMessage = "Không tìm thấy tài nguyên. Vui lòng thử lại.";
  else if (status >= 500) (error as any).userMessage = "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  else (error as any).userMessage = "Yêu cầu thất bại. Vui lòng thử lại.";

  return error;
}

// -----------------------------------------------------
// Request interceptor
// -----------------------------------------------------
api.interceptors.request.use(async (config) => {
  const token = await tokenStore.getAccessToken();
  const guestKey = await guestStore.get();

  // đảm bảo headers tồn tại
  config.headers = (config.headers || {}) as any;

  if (token) (config.headers as any).Authorization = `Bearer ${token}`;
  if (guestKey) (config.headers as any)["x-guest-key"] = guestKey;

  const isFD = isFormData(config.data);

  if (isFD) {
    // quan trọng: xóa hết content-type để axios/native tự set boundary
    delete (config.headers as any)["Content-Type"];
    delete (config.headers as any)["content-type"];
  } else {
    // chỉ set JSON nếu chưa có
    if (
      !(config.headers as any)["Content-Type"] &&
      !(config.headers as any)["content-type"]
    ) {
      (config.headers as any)["Content-Type"] = "application/json";
    }
  }

  return config;
});

// -----------------------------------------------------
// Refresh queue
// -----------------------------------------------------
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

// -----------------------------------------------------
// Response interceptor (401 handling)
// -----------------------------------------------------
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError<any>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean });

    // ✅ lỗi không có response / không phải 401 => attach message & throw
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(attachUserMessage(error));
    }

    const url = String(original?.url || "");

    // ✅ 401 từ LOGIN/REGISTER/... => KHÔNG refresh, KHÔNG emit "hết phiên"
    // UI tự xử lý message (attachUserMessage sẽ map login 401)
    if (isAuthEndpoint(url) && !url.includes("/auth/refresh")) {
      return Promise.reject(attachUserMessage(error));
    }

    // tránh retry loop
    if (original?._retry) return Promise.reject(attachUserMessage(error));
    original._retry = true;

    // ✅ Nếu chính refresh bị 401 => logout ngay + notify
    if (url.includes("/auth/refresh")) {
      await tokenStore.clearTokens();
      resolveQueue(null);
      notifyLoginAgain("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return Promise.reject(attachUserMessage(error));
    }

    // nếu không có refresh token => coi như hết phiên
    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) {
      await tokenStore.clearTokens();
      resolveQueue(null);
      notifyLoginAgain("Vui lòng đăng nhập lại.");
      return Promise.reject(attachUserMessage(error));
    }

    // đang refresh -> chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((newToken) => {
          if (!newToken) return reject(attachUserMessage(error));
          original.headers = (original.headers || {}) as any;
          (original.headers as any).Authorization = `Bearer ${newToken}`;

          // nếu original là FormData thì xóa Content-Type trước khi retry
          if (isFormData(original.data)) {
            delete (original.headers as any)["Content-Type"];
            delete (original.headers as any)["content-type"];
          }

          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const resp = await axios.post<Tokens>(
        `${baseURL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );

      const tokens = resp.data;
      await tokenStore.setTokens(tokens);

      // refresh ok => reset fail count
      refreshFailCount = 0;

      resolveQueue(tokens.accessToken);

      original.headers = (original.headers || {}) as any;
      (original.headers as any).Authorization = `Bearer ${tokens.accessToken}`;

      // nếu original là FormData thì xóa Content-Type trước khi retry
      if (isFormData(original.data)) {
        delete (original.headers as any)["Content-Type"];
        delete (original.headers as any)["content-type"];
      }

      return api(original);
    } catch (e: any) {
      resolveQueue(null);
      await tokenStore.clearTokens();

      refreshFailCount += 1;
      if (refreshFailCount >= 2) {
        notifyLoginAgain("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        refreshFailCount = 0;
      }

      if (axios.isAxiosError(e)) return Promise.reject(attachUserMessage(e));
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
