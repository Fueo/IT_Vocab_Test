import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Core
import theme from "../../theme";
import { AppButton, AppText } from "../core";
import AppDialog, { DialogType } from "../core/AppDialog";
import HomeHeader from "../core/HomeHeader";
import PaginationControl from "../core/PaginationControl";

// Sub-components
import InventoryDetailPanel from "./core/InventoryDetailPanel";
import InventorySlot from "./core/InventorySlot";

// API
import { InventoryItemDto as ApiInvItem, inventoryApi } from "@/api/inventory";

// refresh profile after equip/unequip
import { guestStore } from "@/storage/guest";
import { tokenStore } from "../../storage/token";
import { fetchProfile } from "../../store/profileActions";

// mirror backend enums
export type ApiItemType = "SKIN" | "CONSUMABLE";
export type ApiDurationType = "PERMANENT" | "DAYS" | null;
export type ApiEffectType = "XP_MULTIPLIER" | "NONE" | string;

// UI enums
export type UIItemType = "Consumable" | "Cosmetic";
export type UIDurationType = "Days" | "Permanent";
export type UIEffectType = "XP_Multiplier" | "Frame_Skin" | "None";

export interface ItemDefinition {
  ItemID: string;
  ItemName: string;
  ItemImageURL?: string | null;
  ItemType: UIItemType;

  EffectType: UIEffectType;
  EffectValue?: string | null;

  DurationType: UIDurationType;
  DurationValue?: number | null;

  Description?: string | null;
}

export interface InventoryItem {
  InventoryID: string;
  Item: ItemDefinition;
  Quantity: number;
  IsActive: boolean;

  AcquiredAt?: string | null;
  ActivatedAt?: string | null;
  ExpiredAt?: string | null;
}

// ---------------------------------------------------------
// Layout Config
// ---------------------------------------------------------
const { width } = Dimensions.get("window");

const ITEMS_PER_ROW = 5;
const ITEMS_PER_PAGE = 15;

const SCREEN_PADDING = theme.spacing.md;
const FRAME_PADDING = theme.spacing.smd;
const GAP_SIZE = theme.spacing.sm;

const AVAILABLE_WIDTH = width - SCREEN_PADDING * 2 - FRAME_PADDING * 2;
const TOTAL_GAPS = (ITEMS_PER_ROW - 1) * GAP_SIZE;
const SLOT_SIZE = (AVAILABLE_WIDTH - TOTAL_GAPS) / ITEMS_PER_ROW;

const TAB_BAR_BUFFER = 16;

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
function normalizeParamString(v: unknown): string | null {
  if (!v) return null;
  if (Array.isArray(v)) return String(v[0] ?? "") || null;
  return String(v) || null;
}

function mapApiToUIItem(x: ApiInvItem): InventoryItem {
  const apiItemType = String((x as any).itemType || "").toUpperCase() as ApiItemType;
  const apiDurationType = ((x as any).durationType ?? null) as ApiDurationType;
  const apiEffectType = String((x as any).effectType ?? "NONE").toUpperCase() as ApiEffectType;

  const isSkin = apiItemType === "SKIN";
  const durationType: UIDurationType = apiDurationType === "DAYS" ? "Days" : "Permanent";

  const effectType: UIEffectType =
    isSkin ? "Frame_Skin" : apiEffectType === "XP_MULTIPLIER" ? "XP_Multiplier" : "None";

  const activatedAt = (x as any)?.active?.equippedAt ?? (x as any)?.active?.startAt ?? null;
  const expiredAt = (x as any)?.active?.endAt ?? null;

  return {
    InventoryID: String((x as any).inventoryId ?? x.itemId ?? ""),
    Quantity: Number((x as any).quantity ?? 0),
    IsActive: !!(x as any).isActive,

    AcquiredAt: (x as any).acquireAt ? String((x as any).acquireAt) : null,
    ActivatedAt: activatedAt ? String(activatedAt) : null,
    ExpiredAt: expiredAt ? String(expiredAt) : null,

    Item: {
      ItemID: String((x as any).itemId),
      ItemName: String((x as any).itemName ?? "Unknown Item"),
      ItemImageURL: (x as any).itemImageURL ?? null,
      ItemType: isSkin ? "Cosmetic" : "Consumable",

      EffectType: effectType,
      EffectValue: (x as any).effectValue != null ? String((x as any).effectValue) : null,

      DurationType: durationType,
      DurationValue: (x as any).durationValue != null ? Number((x as any).durationValue) : null,

      Description: (x as any).description ?? null,
    },
  };
}

const InventoryView = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const paramItemId = useMemo(
    () => normalizeParamString((params as any)?.itemId),
    [params]
  );

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [pageItems, setPageItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogConfig, setDialogConfig] = useState<{
    visible: boolean;
    type: DialogType;
    title: string;
    message: string;
    confirmText?: string;
    closeText?: string;
    isDestructive?: boolean;
    onConfirm?: (() => void) | undefined;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const handledItemIdRef = useRef<string | null>(null);

  const handleCloseDialog = () => {
    setDialogConfig((prev) => ({ ...prev, visible: false, onConfirm: undefined }));
  };

  const openLoginConfirm = () => {
    setDialogConfig({
      visible: true,
      type: "confirm",
      title: "Đăng nhập ngay?",
      message: "Bạn cần đăng nhập để sử dụng chức năng Inventory.",
      closeText: "Để sau",
      confirmText: "Đăng nhập",
      isDestructive: false,
      onConfirm: () => {
        handleCloseDialog();
        guestStore.clear();
        if (router.canDismiss()) {
          router.dismiss();
        }
        router.replace("/auth/login");
      },
    });
  };

  // ✅ Check token (chỉ để quyết định render + có gọi API hay không)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await tokenStore.getAccessToken();
        if (!alive) return;
        const ok = !!token;
        setIsAuthed(ok);

        if (!ok) {
          // reset UI data
          setPageItems([]);
          setSelectedItem(null);
          setCurrentPage(0);
          setTotalPages(1);
          setTotalItems(0);
          setHasLoadedOnce(true);
        }
      } catch {
        if (!alive) return;
        setIsAuthed(false);
        setPageItems([]);
        setSelectedItem(null);
        setCurrentPage(0);
        setTotalPages(1);
        setTotalItems(0);
        setHasLoadedOnce(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const fetchPage = async (pageIndex0: number, opts?: { refreshing?: boolean }) => {
    // ✅ CHẶN gọi API nếu chưa login
    const token = await tokenStore.getAccessToken();
    if (!token) {
      setIsAuthed(false);
      setLoading(false);
      setRefreshing(false);
      setHasLoadedOnce(true);
      return;
    }

    setIsAuthed(true);

    const page1 = pageIndex0 + 1;
    const isRefresh = !!opts?.refreshing;

    if (!isRefresh) setLoading(true);

    try {
      const res = await inventoryApi.getInventory({ page: page1, limit: ITEMS_PER_PAGE });
      const mapped = (res.items || []).map(mapApiToUIItem);

      setPageItems(mapped);
      setCurrentPage((res.pagination?.page ?? page1) - 1);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotalItems(res.pagination?.total ?? 0);

      setSelectedItem((prev) => {
        if (!prev) return prev;
        const found = mapped.find((it) => it.Item.ItemID === prev.Item.ItemID);
        return found ?? prev;
      });

      return { mapped, pagination: res.pagination };
    } catch (e: any) {
      const msg = e?.userMessage || "Failed to load inventory.";
      setDialogConfig({
        visible: true,
        type: "error",
        title: "Rất tiếc",
        message: msg,
        confirmText: "Đóng",
      });
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
      setHasLoadedOnce(true);
    }
  };

  // ✅ chỉ fetch lần đầu nếu đã authed
  useEffect(() => {
    if (isAuthed === null) return;
    if (!isAuthed) return;

    fetchPage(0).catch(() => {
      setPageItems([]);
      setTotalPages(1);
      setTotalItems(0);
      setHasLoadedOnce(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  // ✅ handle deep link itemId: chỉ chạy khi authed
  useEffect(() => {
    if (!paramItemId) return;
    if (!hasLoadedOnce) return;
    if (!isAuthed) return;

    if (handledItemIdRef.current === paramItemId) return;

    const run = async () => {
      const inCurrent = pageItems.find((it) => it.Item.ItemID === paramItemId);
      if (inCurrent) {
        setSelectedItem(inCurrent);
        handledItemIdRef.current = paramItemId;
        return;
      }

      for (let p0 = 0; p0 < totalPages; p0++) {
        try {
          const res = await inventoryApi.getInventory({ page: p0 + 1, limit: ITEMS_PER_PAGE });
          const mapped = (res.items || []).map(mapApiToUIItem);

          const found = mapped.find((it) => it.Item.ItemID === paramItemId);
          if (found) {
            setPageItems(mapped);
            setCurrentPage(p0);
            setTotalPages(res.pagination?.totalPages ?? totalPages);
            setTotalItems(res.pagination?.total ?? totalItems);
            setSelectedItem(found);
            handledItemIdRef.current = paramItemId;
            return;
          }
        } catch {
          // ignore
        }
      }

      handledItemIdRef.current = paramItemId;
    };

    run();
  }, [paramItemId, hasLoadedOnce, isAuthed, pageItems, totalPages, totalItems]);

  const currentItems = useMemo(() => pageItems, [pageItems]);

  const onRefresh = async () => {
    // ✅ chưa login => không refresh API, chỉ mở confirm login
    const token = await tokenStore.getAccessToken();
    if (!token) {
      setIsAuthed(false);
      setRefreshing(false);
      openLoginConfirm();
      return;
    }

    setRefreshing(true);
    try {
      await fetchPage(currentPage, { refreshing: true });
    } catch {
      setRefreshing(false);
    }
  };

  const refreshProfileIfLoggedIn = async () => {
    const token = await tokenStore.getAccessToken();
    if (!token) return;
    await fetchProfile({ silent: true });
  };

  const handleUseItem = async () => {
    const token = await tokenStore.getAccessToken();
    if (!token) {
      setIsAuthed(false);
      openLoginConfirm();
      return;
    }

    if (!selectedItem) return;

    const isCosmetic = selectedItem.Item.ItemType === "Cosmetic";

    try {
      setRefreshing(true);

      // Cosmetic + đang active => UNEQUIP
      if (isCosmetic && selectedItem.IsActive) {
        await inventoryApi.unequipSkin();

        setDialogConfig({
          visible: true,
          type: "success",
          title: "Unequipped",
          message: `You unequipped ${selectedItem.Item.ItemName}.`,
          confirmText: "Đóng",
        });

        await fetchPage(currentPage, { refreshing: true });
        await refreshProfileIfLoggedIn();
        return;
      }

      // còn lại: useItem
      const res = await inventoryApi.useItem({ itemId: selectedItem.Item.ItemID });

      const msg =
        res?.result?.type === "SKIN"
          ? `You have equipped ${selectedItem.Item.ItemName}!`
          : `You used ${selectedItem.Item.ItemName}.`;

      setDialogConfig({
        visible: true,
        type: "success",
        title: "Success",
        message: msg,
        confirmText: "Đóng",
      });

      await fetchPage(currentPage, { refreshing: true });
      await refreshProfileIfLoggedIn();
    } catch (e: any) {
      const errorMsg = e?.userMessage || (isCosmetic ? "Action failed." : "Use item failed.");

      setDialogConfig({
        visible: true,
        type: "error",
        title: "Rất tiếc!",
        message: errorMsg,
        confirmText: "Đóng",
      });

      setRefreshing(false);
    }
  };

  // ✅ Nếu user chưa login: chỉ render HomeHeader + empty state
  if (isAuthed === false) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + TAB_BAR_BUFFER },
          ]}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
          alwaysBounceVertical
          overScrollMode="always"
          keyboardShouldPersistTaps="handled"
        >
          <HomeHeader
            title="Inventory"
            subtitle="Đăng nhập để xem vật phẩm"
            rightIcon="filter"
            onRightIconPress={() => { }}
          />

          <View style={[styles.lockWrap, { paddingHorizontal: SCREEN_PADDING }]}>
            <AppText size="md" weight="bold" color={theme.colors.text.primary} style={{ textAlign: "center" }}>
              Bạn cần đăng nhập để dùng chức năng này
            </AppText>

            <AppText size="sm" color={theme.colors.text.secondary} style={{ textAlign: "center", marginTop: 8 }}>
              Inventory sẽ lưu trữ vật phẩm của bạn và cho phép trang bị / sử dụng.
            </AppText>

            <AppButton
              title="Đăng nhập"
              onPress={openLoginConfirm}
              variant="primary"
              style={{ marginTop: theme.spacing.lg, width: "100%" }}
            />
          </View>

          <AppDialog
            visible={dialogConfig.visible}
            type={dialogConfig.type}
            title={dialogConfig.title}
            message={dialogConfig.message}
            onClose={handleCloseDialog}
            onConfirm={dialogConfig.type === "confirm" ? dialogConfig.onConfirm : undefined}
            closeText={dialogConfig.closeText}
            confirmText={dialogConfig.confirmText}
            isDestructive={dialogConfig.isDestructive}
          />
        </ScrollView>
      </View>
    );
  }

  // (Loading token lần đầu) -> có thể show skeleton nhẹ
  if (isAuthed === null) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + TAB_BAR_BUFFER },
          ]}
          alwaysBounceVertical
          overScrollMode="always"
        >
          <HomeHeader title="Inventory" subtitle="Loading..." rightIcon="filter" onRightIconPress={() => { }} />
          <View style={[styles.lockWrap, { paddingHorizontal: SCREEN_PADDING }]}>
            <AppText size="sm" color={theme.colors.text.secondary} style={{ textAlign: "center" }}>
              Đang kiểm tra đăng nhập...
            </AppText>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ✅ Logged in UI (full)
  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + TAB_BAR_BUFFER },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        alwaysBounceVertical
        overScrollMode="always"
        keyboardShouldPersistTaps="handled"
      >
        <HomeHeader
          title="Inventory"
          subtitle={`Storage: ${totalItems} Items`}
          rightIcon="filter"
          onRightIconPress={() => console.log("Filter pressed")}
        />

        <View style={styles.body}>
          <View style={styles.gridWrapper}>
            <View style={styles.inventoryFrame}>
              <View style={styles.gridRow}>
                {currentItems.map((item) => (
                  <InventorySlot
                    key={item.InventoryID}
                    item={item}
                    size={SLOT_SIZE}
                    isSelected={selectedItem?.InventoryID === item.InventoryID}
                    onPress={() => setSelectedItem(item)}
                  />
                ))}

                {Array.from({ length: Math.max(0, ITEMS_PER_PAGE - currentItems.length) }).map((_, i) => (
                  <InventorySlot key={`empty_${i}`} size={SLOT_SIZE} />
                ))}
              </View>

              <PaginationControl
                currentPage={currentPage + 1}
                totalPages={totalPages}
                onPageChange={(page1) => fetchPage(page1 - 1)}
                isLoading={loading || refreshing}
              />
            </View>
          </View>

          <View style={styles.detailWrapper}>
            <InventoryDetailPanel selectedItem={selectedItem} onUseItem={handleUseItem} />
          </View>
        </View>

        <AppDialog
          visible={dialogConfig.visible}
          type={dialogConfig.type}
          title={dialogConfig.title}
          message={dialogConfig.message}
          onClose={handleCloseDialog}
          onConfirm={dialogConfig.type === "confirm" ? dialogConfig.onConfirm : undefined}
          closeText={dialogConfig.closeText}
          confirmText={dialogConfig.confirmText}
          isDestructive={dialogConfig.isDestructive}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
  },
  gridWrapper: {
    padding: SCREEN_PADDING,
    paddingBottom: theme.spacing.sm,
  },
  inventoryFrame: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: FRAME_PADDING,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP_SIZE,
  },
  detailWrapper: {
    marginTop: theme.spacing.md,
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 0,
    minHeight: 210,
  },

  // ✅ empty state when not logged in
  lockWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
});

export default InventoryView;
