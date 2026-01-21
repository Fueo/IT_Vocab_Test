// src/api/dictionary.ts
import { api } from "./client";

// =======================
// Types
// =======================

export type TopicDto = {
  _id: string;
  topicName: string;
  description: string | null;
  maxLevel: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Full Word DTO (dùng cho getWordDetail / pinned / note...)
 * listWords KHÔNG dùng nữa vì backend đã trả minimal item
 */
export type WordDto = {
  _id: string;
  word: string;
  pronunciation: string | null;
  meaningEN: string | null;
  meaningVN: string | null;
  standFor: string | null;
  example: string | null;

  level: number;
  isActive: boolean;

  topicId: string;
  topicName: string; // ✅ Thêm dòng này để hứng tên Topic từ API

  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;

  // optionalAuth enrich
  isPinned?: boolean;
  note?: string | null;
};

export type PaginationRes<T> = {
  message: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
};

// =======================
// List words (UPDATED to minimal item response)
// =======================

export type DictionaryLevel = "beginner" | "intermediate" | "advanced";

/**
 * Backend listWords trả item dạng tối giản:
 * { id, term, phonetic, definition, level, category, isPinned, note }
 */
export type ListWordsItemDto = {
  id: string;
  term: string;
  phonetic: string;
  definition: string;
  level: number | DictionaryLevel; // backend có thể trả number hoặc label
  category: string; // topicName (backend đã populate)
  example?: string;
  isPinned?: boolean;
  note?: string | null;
};

export type ListWordsQuery = {
  page?: number;
  pageSize?: number;
  topicId?: string | "all";
  include?: "topics" | "topics,words" | string; // server only checks "topics"
  q?: string;
};

export type ListWordsRes = PaginationRes<ListWordsItemDto> & {
  topics?: TopicDto[];
};

// =======================
// Word detail
// =======================

export type GetWordDetailRes = {
  message: string;
  word: WordDto;
};

// =======================
// Pin / Unpin
// =======================

export type PinWordRes = { message: string };
export type UnpinWordRes = { message: string };

// =======================
// Pinned list
// =======================

export type PinnedItem = {
  pinnedId: string;
  createdAt: string;
  word: WordDto;
};

export type ListPinnedWordsRes = PaginationRes<PinnedItem>;

// =======================
// Note
// =======================

export type UpsertNoteBody = { note: string };

export type UpsertNoteRes = {
  message: string;
  note: {
    noteId: string;
    wordId: string;
    userId: string;
    note: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteNoteRes = { message: string };

// =======================
// API
// =======================

export const dictionaryApi = {
  // GET /dictionary/words
  listWords(params?: ListWordsQuery) {
    return api.get<ListWordsRes>("/dictionary/words", { params }).then((r) => r.data);
  },

  // GET /dictionary/words/:wordId (full WordDto)
  getWordDetail(wordId: string) {
    return api.get<GetWordDetailRes>(`/dictionary/words/${wordId}`).then((r) => r.data);
  },

  // PUT /dictionary/words/:wordId/pin
  pinWord(wordId: string) {
    return api.put<PinWordRes>(`/dictionary/words/${wordId}/pin`).then((r) => r.data);
  },

  // DELETE /dictionary/words/:wordId/pin
  unpinWord(wordId: string) {
    return api.delete<UnpinWordRes>(`/dictionary/words/${wordId}/pin`).then((r) => r.data);
  },

  // GET /dictionary/pinned
  listPinnedWords(params?: { page?: number; pageSize?: number }) {
    return api.get<ListPinnedWordsRes>("/dictionary/pinned", { params }).then((r) => r.data);
  },

  // PUT /dictionary/words/:wordId/note
  upsertNote(wordId: string, body: UpsertNoteBody) {
    return api.put<UpsertNoteRes>(`/dictionary/words/${wordId}/note`, body).then((r) => r.data);
  },

  // DELETE /dictionary/words/:wordId/note
  deleteNote(wordId: string) {
    return api.delete<DeleteNoteRes>(`/dictionary/words/${wordId}/note`).then((r) => r.data);
  },
};

// =======================
// UI helper (DictionaryView-compatible)
// =======================

export type DictionaryItem = {
  id: string;
  term: string;
  phonetic: string;
  definition: string;
  level: DictionaryLevel;
  category: string;
  example?: string;
  isPinned?: boolean;
  note?: string | null;
};

export type FetchDictionaryRes = {
  data: DictionaryItem[];
  total: number;
  totalPages: number;
  topics?: TopicDto[];
};

let topicsCache: TopicDto[] | null = null;

export async function fetchDictionaryApi(
  page: number,
  limit: number,
  category: string, // Category Name từ UI (VD: "DevOps")
  search: string
): Promise<FetchDictionaryRes> {
  
  // 1. Xác định topicId từ category name
  // Nếu chưa có cache (lần đầu vào app), mặc định là 'all' vì UI cũng đang để 'All Topics'
  let topicId: string | "all" = "all";
  
  if (category !== "All Topics" && topicsCache) {
    const found = topicsCache.find((t) => t.topicName === category);
    topicId = found?._id ?? "all";
  }

  // 2. Xác định có cần lấy kèm topics không
  // Chỉ lấy topics khi tải trang 1 (để init CategorySelector)
  const shouldIncludeTopics = page === 1;

  // 3. Gọi API (Chỉ 1 request duy nhất)
  const res = await dictionaryApi.listWords({
    page,
    pageSize: limit,
    topicId,
    q: search?.trim() ? search.trim() : undefined,
    include: shouldIncludeTopics ? "topics" : undefined, 
  });

  // 4. Nếu server trả về topics, cập nhật vào cache ngay
  if (res.topics && res.topics.length > 0) {
    topicsCache = res.topics;
  }

  // 5. Trả về dữ liệu đã format
  return {
    data: (res.items ?? []).map(toDictionaryItem),
    total: res.total,
    totalPages: res.totalPages,
    // Chỉ trả topics ra ngoài nếu API có trả về (tức là page 1)
    topics: res.topics, 
  };
}

function normalizeLevel(level: number | DictionaryLevel | undefined): DictionaryLevel {
  if (typeof level === "string") return level;
  const lv = Number(level ?? 1);
  if (lv <= 1) return "beginner";
  if (lv === 2) return "intermediate";
  return "advanced";
}

function toDictionaryItem(x: ListWordsItemDto): DictionaryItem {
  return {
    id: String(x.id),
    term: x.term ?? "",
    phonetic: x.phonetic ?? "",
    definition: x.definition ?? "",
    level: normalizeLevel(x.level),
    category: x.category ?? "",
    example: x.example,
    isPinned: x.isPinned ?? false,
    note: x.note ?? null,
  };
}

/**
 * Drop-in replacement for mock fetchDictionaryApi used in DictionaryView
 *
 * - Lần đầu (page=1) include=topics để build CategorySelector
 * - category filter: UI dùng topicName => map sang topicId bằng topicsCache
 */

export function getCachedCategories(): string[] {
  const names = topicsCache?.map((t) => t.topicName) ?? [];
  return ["All Topics", ...names];
}
