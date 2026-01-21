import { api } from "./client";

// =======================
// Types: Common & DTOs
// =======================

export type FeedbackStatus = "open" | "resolved" | "closed" | "pending";

/**
 * Type trả về chung cho danh sách phân trang
 * (Khớp format với dictionary.ts và BE response)
 */
export type PaginationRes<T> = {
  message: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
};

/**
 * User info bên trong Admin List Item
 */
export type FeedbackCreatorDto = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

/**
 * Item Feedback trả về (Dùng chung cho cả Admin & User)
 * Admin sẽ có thêm field createdBy
 */
export type FeedbackItemDto = {
  id: string;
  title: string;
  reason: string;
  content: string;
  status: FeedbackStatus;
  createdAt: string;
  // Field này chỉ có khi gọi API Admin
  createdBy?: FeedbackCreatorDto | null;
};

// =======================
// Request Params & Bodies
// =======================

// Query params cho danh sách (Admin & User)
export type FeedbackListQuery = {
  page?: number;
  pageSize?: number;
  status?: FeedbackStatus | "all";
  // Admin only params
  reason?: string | "all";
  q?: string; // Search keyword
};

// Body tạo mới
export type CreateFeedbackBody = {
  title: string;
  reason: string;
  content: string;
};

// Body cập nhật (Dùng chung cho cả Admin & User)
// - User: gửi title, reason, content
// - Admin: gửi status
export type UpdateFeedbackBody = {
  title?: string;
  reason?: string;
  content?: string;
  status?: FeedbackStatus;
};

// Query params cho Admin Delete All
export type AdminDeleteAllQuery = {
  reason?: string | "all";
  status?: FeedbackStatus | "all";
};

// =======================
// Responses
// =======================

export type CreateFeedbackRes = {
  message: string;
  feedback: FeedbackItemDto;
};

export type UpdateFeedbackRes = {
  message: string;
};

export type DeleteFeedbackRes = {
  message: string;
};

export type AdminDeleteAllRes = {
  message: string;
  deletedCount: number;
};

// =======================
// API
// =======================

export const feedbackApi = {
  // =========================
  // USER API
  // =========================

  /**
   * GET /feedback/my
   * Lấy danh sách feedback của user hiện tại
   */
  getMyFeedback(params?: FeedbackListQuery) {
    return api
      .get<PaginationRes<FeedbackItemDto>>("/feedback/my", { params })
      .then((r) => r.data);
  },

  /**
   * POST /feedback
   * Tạo feedback mới
   */
  createFeedback(body: CreateFeedbackBody) {
    return api
      .post<CreateFeedbackRes>("/feedback", body)
      .then((r) => r.data);
  },

  // =========================
  // ADMIN API
  // =========================

  /**
   * GET /feedback/admin
   * Admin lấy danh sách toàn bộ feedback (có filter, search)
   */
  adminListFeedback(params?: FeedbackListQuery) {
    return api
      .get<PaginationRes<FeedbackItemDto>>("/feedback/admin", { params })
      .then((r) => r.data);
  },

  /**
   * DELETE /feedback/admin
   * Admin xoá hàng loạt feedback theo filter
   */
  adminDeleteAll(params?: AdminDeleteAllQuery) {
    return api
      .delete<AdminDeleteAllRes>("/feedback/admin", { params })
      .then((r) => r.data);
  },

  // =========================
  // SHARED API (User & Admin)
  // =========================

  /**
   * PUT /feedback/:feedbackId
   * - User: Sửa title/reason/content (chỉ khi open)
   * - Admin: Sửa status (resolved/closed/open)
   */
  updateFeedback(feedbackId: string, body: UpdateFeedbackBody) {
    return api
      .put<UpdateFeedbackRes>(`/feedback/${feedbackId}`, body)
      .then((r) => r.data);
  },

  /**
   * DELETE /feedback/:feedbackId
   * - User: Xoá của mình (chỉ khi open)
   * - Admin: Xoá bất kỳ
   */
  deleteFeedback(feedbackId: string) {
    return api
      .delete<DeleteFeedbackRes>(`/feedback/${feedbackId}`)
      .then((r) => r.data);
  },
};