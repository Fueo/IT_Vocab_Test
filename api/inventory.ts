// src/api/inventory.ts
import { api } from "./client";

// ===== Types =====

export type ItemType = "SKIN" | "CONSUMABLE";
export type DurationType = "PERMANENT" | "DAYS" | null;
export type EffectType = "XP_MULTIPLIER" | "NONE";

export type InventoryQuery = {
  page?: number;
  limit?: number; // default backend 15
};

export type InventoryActiveMeta =
  | {
      // SKIN equipped
      slotType: string;
      equippedAt: string | null;
    }
  | {
      // CONSUMABLE active effect
      startAt: string | null;
      endAt: string | null;
    }
  | null;

export type InventoryItemDto = {
  itemId: string;
  itemName: string | null;
  itemImageURL?: string | null;
  itemType: ItemType | string | null;

  quantity: number;

  // UI tick
  isActive: boolean;

  // for detail UI
  durationType: DurationType;
  durationValue: number | null;

  effectType: EffectType | string | null;
  effectValue: number | null;

  // only when active
  active: InventoryActiveMeta;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type InventoryRes = {
  message: string;
  items: InventoryItemDto[];
  pagination: Pagination;
  equippedSkinItemId?: string | null;
  serverTime?: string; // optional
};

export type UseItemBody = {
  itemId: string;
};

export type UseItemRes = {
  message: string;
  result: {
    type: "SKIN" | "CONSUMABLE";
    inventory?: { itemId: string; quantity: number };
    equipped?: {
      userEquippedId?: string;
      slotType?: string;
      itemId?: string;
      equippedAt?: string | null;
    } | null;
    userEffect?: {
      userEffectId?: string;
      effectType?: string;
      effectValue?: number | null;
      startAt?: string | null;
      endAt?: string | null;
      isActive?: boolean;
    } | null;
    meta?: {
      durationType?: string | null;
      isPermanent?: boolean;
      consumed?: number;
    };
  };
};

export type UnequipSkinRes = {
  message: string;
  removed: {
    userEquippedId: string;
    itemId: string;
    slotType: string;
  } | null;
};

// ===== API =====

export const inventoryApi = {
  /**
   * GET /inventory?page=1&limit=15
   */
  getInventory(params?: InventoryQuery) {
    return api.get<InventoryRes>("/inventory", { params }).then((r) => r.data);
  },

  /**
   * POST /inventory/use
   * body: { itemId }
   */
  useItem(body: UseItemBody) {
    return api.post<UseItemRes>("/inventory/use", body).then((r) => r.data);
  },

  /**
   * POST /inventory/unequip-skin
   */
  unequipSkin() {
    return api.post<UnequipSkinRes>("/inventory/unequip-skin").then((r) => r.data);
  },
};
