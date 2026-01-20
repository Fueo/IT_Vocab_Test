// api/quiz.ts
import { api } from "./client";

// =======================
// Types (match BE response)
// =======================

export type QuizMode = "TOPIC" | "RANDOM" | "INFINITE" | "LEARN";
export type AttemptStatus = "IN_PROGRESS" | "FINISHED" | "ABANDONED";

export type AttemptSummary = {
  attemptId: string;
  mode: QuizMode;
  topicId: string | null;
  level: number | null;
  status: AttemptStatus;
  totalQuestions: number;
  correctAnswers: number;
  earnedXP: number;
};

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";

export type AnswerOptionDto = {
  _id: string;
  content: string;
  isCorrect?: boolean; // only in review endpoint
};

export type ThinWord = {
  _id: string;
  term?: string;
  meaning?: string;
  word?: string;
  definition?: string;
  pronunciation?: string;
  example?: string;
  audioUrl?: string;
  imageUrl?: string;
  [k: string]: any;
};

export type AttemptAnswerDto = {
  _id: string;
  selectedOptionId: string | null;
  answerText: string | null;
  isCorrect: boolean | null;
  answeredAt: string | null;
};

export type QuestionDto = {
  questionId: string;
  content: string;
  questionType: QuestionType;
  wordId: string | null;
  options: AnswerOptionDto[];
  word: ThinWord | null;
  attemptAnswer: AttemptAnswerDto | null;
};

// =======================
// Quizzes list (topics paginated)
// =======================

export type TopicQuizItem = {
  topicId: string;
  level: number;
  title: string;
  mode: "TOPIC";
};

export type QuizzesByTopicsRes = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: TopicQuizItem[];
};

// =======================
// Start
// =======================

export type StartAttemptBody = {
  mode: QuizMode;
  topicId?: string;
  level?: number;
  totalQuestions?: number;
};

export type StartAttemptRes = {
  attempt: AttemptSummary;
  cursor: number;
  canPrev: boolean;
  canNext: boolean;
  question: QuestionDto;
};

// =======================
// Get question by cursor
// =======================

export type GetQuestionByCursorRes =
  | {
    attempt: AttemptSummary;
    cursor: number;
    canPrev: boolean;
    canNext: boolean;
    question: QuestionDto;
  }
  | {
    message: string;
    requireNextBatch?: boolean;
    cursor?: number;
    totalQuestions?: number;
  };

// =======================
// Submit & Next
// =======================

export type SubmitAndNextBody = {
  cursor: number;
  attemptAnswerId?: string;
  selectedOptionId?: string;
  answerText?: string;
};

export type SubmitResult = {
  attemptAnswerId: string;
  isCorrect: boolean | null;
  correctOptionId?: string | null;
  correctAnswers?: string[] | null;
};

export type SubmitAndNextRes = {
  attempt: AttemptSummary;
  current: { cursor: number; result: SubmitResult };
  next: null | { cursor: number; question: QuestionDto };
  finished: boolean;
  canFinish?: boolean;
  batchAppended?: boolean;
  message?: string;
};

// =======================
// Attempt details (paged)
// =======================

export type GetAttemptRes = {
  attempt: AttemptSummary;
  page: number;
  pageSize: number;
  totalQuestions: number;
  totalPages: number;
  questions: QuestionDto[];
};

// =======================
// Next batch (INFINITE)
// =======================

export type NextBatchRes = {
  items: QuestionDto[];
  totalQuestions: number;
  message?: string;
};

// =======================
// Update answer
// =======================

export type UpdateAnswerBody = {
  selectedOptionId?: string;
  answerText?: string;
};

export type UpdateAnswerRes = {
  attemptAnswerId: string;
  isCorrect: boolean;
  correctOptionId: string | null;
  correctAnswers: string[] | null;
};

// =======================
// Finish
// =======================

export type FinishAttemptRes = {
  attemptId: string;
  totalQuestions: number;
  correctAnswers: number;
  earnedXP: number;
  status: AttemptStatus;
};

// =======================
// History
// =======================

export type AttemptHistoryItem = {
  attemptId: string;
  mode: QuizMode;
  topicId: string | null;
  level: number | null;
  totalQuestions: number;
  correctAnswers: number;
  earnedXP: number;
  status: AttemptStatus;
  createdAt: string;
  finishedAt: string | null;
};

export type HistoryQuery = {
  mode?: QuizMode;
  topicId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type HistoryRes = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: AttemptHistoryItem[];
};

// =======================
// Review
// =======================

export type ReviewItem = {
  question: {
    questionId: string;
    content: string;
    questionType: QuestionType;
    wordId: string | null;
    word: ThinWord | null;
    explanation?: string;
  };
  options: AnswerOptionDto[];
  userAnswer: null | {
    selectedOptionId: string | null;
    answerText: string | null;
    isCorrect: boolean | null;
    answeredAt: string | null;
  };
};

export type ReviewRes = {
  attempt: AttemptSummary;
  items: ReviewItem[];
};

// =======================
// Abandon
// =======================

export type AbandonRes = {
  message: string;
  attemptId: string;
  status: AttemptStatus;
};

// =======================
// API (✅ paths fixed per BE router, all start with /quiz)
// =======================

export const quizApi = {
  // GET /quiz/quizzes?page=&pageSize=
  quizzesByTopics(params?: { page?: number; pageSize?: number }) {
    return api.get<QuizzesByTopicsRes>("/quiz/quizzes", { params }).then((r) => r.data);
  },

  // POST /quiz/attempts
  start(body: StartAttemptBody) {
    return api.post<StartAttemptRes>("/quiz/attempts", body).then((r) => r.data);
  },

  // GET /quiz/attempts/:attemptId/questions/:cursor
  getQuestionByCursor(attemptId: string, cursor: number) {
    return api
      .get<GetQuestionByCursorRes>(`/quiz/attempts/${attemptId}/questions/${cursor}`)
      .then((r) => r.data);
  },

  // POST /quiz/attempts/:attemptId/submit
  submitAndNext(attemptId: string, body: SubmitAndNextBody) {
    return api
      .post<SubmitAndNextRes>(`/quiz/attempts/${attemptId}/submit`, body)
      .then((r) => r.data);
  },

  // GET /quiz/attempts/:attemptId?page=&pageSize=
  getAttempt(attemptId: string, params?: { page?: number; pageSize?: number }) {
    return api.get<GetAttemptRes>(`/quiz/attempts/${attemptId}`, { params }).then((r) => r.data);
  },

  // POST /quiz/attempts/:attemptId/next-batch
  nextBatch(attemptId: string) {
    return api.post<NextBatchRes>(`/quiz/attempts/${attemptId}/next-batch`).then((r) => r.data);
  },

  // PUT /quiz/attempt-answers/:attemptAnswerId
  updateAnswer(attemptAnswerId: string, body: UpdateAnswerBody) {
    return api
      .put<UpdateAnswerRes>(`/quiz/attempt-answers/${attemptAnswerId}`, body)
      .then((r) => r.data);
  },

  // POST /quiz/attempts/:attemptId/finish
  finish(attemptId: string) {
    return api.post<FinishAttemptRes>(`/quiz/attempts/${attemptId}/finish`).then((r) => r.data);
  },

  // GET /quiz/attempts?mode=&topicId=&from=&to=&page=&pageSize=
  history(params?: HistoryQuery) {
    return api.get<HistoryRes>("/quiz/attempts", { params }).then((r) => r.data);
  },

  // GET /quiz/attempts/:attemptId/review
  review(attemptId: string) {
    return api.get<ReviewRes>(`/quiz/attempts/${attemptId}/review`).then((r) => r.data);
  },

  // POST /quiz/attempts/:attemptId/abandon
  abandon(attemptId: string) {
    return api.post<AbandonRes>(`/quiz/attempts/${attemptId}/abandon`).then((r) => r.data);
  },
};
