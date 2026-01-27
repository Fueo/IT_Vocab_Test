import { api } from "./client";

// =======================
// Types: Common & DTOs
// =======================

export type FeedbackStatus = "open" | "resolved" | "closed" | "pending";

export type PaginationRes<T> = {
  message: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
};

export type FeedbackCreatorDto = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type FeedbackItemDto = {
  id: string;
  title: string;
  reason: string;
  content: string;
  status: FeedbackStatus;
  createdAt: string;
  createdBy?: FeedbackCreatorDto | null;
};

// =======================
// Request Params & Bodies
// =======================

export type FeedbackListQuery = {
  page?: number;
  pageSize?: number;
  status?: FeedbackStatus | "all";
  reason?: string | "all";
  q?: string;
};

export type CreateFeedbackBody = {
  title: string;
  reason: string;
  content: string;
};

export type UpdateFeedbackBody = {
  title?: string;
  reason?: string;
  content?: string;
  status?: FeedbackStatus;
};

export type AdminDeleteAllQuery = {
  reason?: string | "all";
  status?: FeedbackStatus | "all";
};

// =======================
// Responses
// =======================

// --- [MỚI] Type cho API lấy link form ---
export type FeedbackFormLinkRes = {
  message: string;
  formLink: string;
};

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

  /**
   * GET /feedback/form
   * [MỚI] Lấy link form feedback
   */
  getFeedbackFormLink() {
    return api
      .get<FeedbackFormLinkRes>("/feedback/form")
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
   */
  updateFeedback(feedbackId: string, body: UpdateFeedbackBody) {
    return api
      .put<UpdateFeedbackRes>(`/feedback/${feedbackId}`, body)
      .then((r) => r.data);
  },

  /**
   * DELETE /feedback/:feedbackId
   */
  deleteFeedback(feedbackId: string) {
    return api
      .delete<DeleteFeedbackRes>(`/feedback/${feedbackId}`)
      .then((r) => r.data);
  },
};