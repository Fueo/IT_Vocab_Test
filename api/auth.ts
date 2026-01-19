import { Tokens, tokenStore } from "../storage/token";
import { api } from "./client";

// ====== Types theo backend bạn ======
export type RegisterBody = { name?: string | null; email: string; password: string };
export type RegisterRes = { userId: string; message: string };

export type LoginBody = { email: string; password: string };

export type Purpose = "signup" | "reset_password";
export type SendCodeBody = { email: string; purpose: Purpose };
export type SendCodeRes = { message: string };

export type VerifyCodeBody = { email: string; purpose: Purpose; code: string };
// signup => { message } ; reset_password => { resetToken }
export type VerifyCodeRes = { message?: string; resetToken?: string };

export type NewPasswordBody = { resetToken: string; newPassword: string };
export type NewPasswordRes = { message: string };

export type LogoutBody = { refreshToken: string };
export type LogoutRes = { message: string };

export type GoogleBody = { idToken: string };
export type FacebookBody = { accessToken: string };

// ====== API ======
export const authApi = {
  // POST /auth/register
  register(body: RegisterBody) {
    return api.post<RegisterRes>("/auth/register", body).then((r) => r.data);
  },

  // POST /auth/login
  async login(body: LoginBody): Promise<Tokens> {
    const tokens = await api.post<Tokens>("/auth/login", body).then((r) => r.data);
    await tokenStore.setTokens(tokens);
    return tokens;
  },

  // POST /auth/send-code
  sendCode(body: SendCodeBody) {
    return api.post<SendCodeRes>("/auth/send-code", body).then((r) => r.data);
  },

  // POST /auth/verify-code
  verifyCode(body: VerifyCodeBody) {
    return api.post<VerifyCodeRes>("/auth/verify-code", body).then((r) => r.data);
  },

  // POST /auth/new-password
  newPassword(body: NewPasswordBody) {
    return api.post<NewPasswordRes>("/auth/new-password", body).then((r) => r.data);
  },

  // POST /auth/refresh (thường không cần gọi tay vì client.ts auto rồi)
  async refresh(): Promise<Tokens> {
    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) throw new Error("Missing refreshToken");

    const tokens = await api.post<Tokens>("/auth/refresh", { refreshToken }).then((r) => r.data);
    await tokenStore.setTokens(tokens);
    return tokens;
  },

  // POST /auth/logout
  async logout(): Promise<LogoutRes> {
    const refreshToken = await tokenStore.getRefreshToken();

    // không có token thì coi như logout local
    if (!refreshToken) {
      await tokenStore.clearTokens();
      return { message: "Already logged out" };
    }

    try {
      const data = await api.post<LogoutRes>("/auth/logout", { refreshToken }).then((r) => r.data);
      await tokenStore.clearTokens();
      return data;
    } catch (e) {
      await tokenStore.clearTokens();
      throw e;
    }
  },

  // POST /auth/google
  async google(body: GoogleBody): Promise<Tokens> {
    const tokens = await api.post<Tokens>("/auth/google", body).then((r) => r.data);
    await tokenStore.setTokens(tokens);
    return tokens;
  },

  // POST /auth/facebook
  async facebook(body: FacebookBody): Promise<Tokens> {
    const tokens = await api.post<Tokens>("/auth/facebook", body).then((r) => r.data);
    await tokenStore.setTokens(tokens);
    return tokens;
  },
};
