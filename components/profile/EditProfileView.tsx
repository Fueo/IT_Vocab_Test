// src/screens/profile/EditProfileView.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import theme from "../../theme";
import {
  AppButton,
  AppDetailHeader,
  AppInput,
  AppText,
  AvatarPickerSheet,
} from "../core";
import AppDialog, { DialogType } from "../core/AppDialog";
import UserAvatar from "./core/UserAvatar";

import { profileApi } from "../../api/profile";
import { fetchProfile } from "../../store/profileActions";
import { useProfileStore } from "../../store/useProfileStore";

type AvatarAsset = {
  uri: string;
  mimeType?: string;
  fileName?: string;
};

function normalizeAvatarAsset(asset: AvatarAsset) {
  const typeRaw = asset.mimeType ?? "image/jpeg";
  const type = typeRaw === "image/jpg" ? "image/jpeg" : typeRaw;
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const name = asset.fileName ?? `avatar-${Date.now()}.${ext}`;

  return { uri: asset.uri, type, name };
}

const AVATAR_SIZE = 120;

type DialogState = {
  visible: boolean;
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  onCloseAction?: () => void;
};

const EditProfileView = () => {
  const navigation = useNavigation();
  const profile = useProfileStore((s) => s.profile);
  const storeLoading = useProfileStore((s) => s.isLoading);

  // ===== Form state =====
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ===== UI state =====
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // ===== Dialog State =====
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
  });

  // ===== Errors =====
  const [errors, setErrors] = useState({ name: "", phone: "" });

  // ===== Helpers =====
  const getErrorMessage = (e: any, fallback: string) => {
    if (e?.userMessage) return e.userMessage;
    const serverMsg = e?.response?.data?.message;
    if (typeof serverMsg === "string" && serverMsg.trim()) return serverMsg;
    if (typeof e?.message === "string" && e.message.trim()) return e.message;
    return fallback;
  };

  const openDialog = (next: Omit<DialogState, "visible">) => {
    setDialog({ ...next, visible: true });
  };

  const closeDialog = () => {
    setDialog((prev) => {
      const action = prev.onCloseAction;
      // đóng trước
      const nextState = { ...prev, visible: false, onCloseAction: undefined };
      // chạy action sau khi state update (microtask)
      if (action) Promise.resolve().then(action);
      return nextState;
    });
  };

  // ===== Init from store =====
  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setAvatarUrl(profile.avatarURL ?? null);
  }, [profile?.userId]);

  // ✅ CHẶN BACK KHI ĐANG UPLOAD HOẶC SAVE
  useEffect(() => {
    const removeListener = navigation.addListener("beforeRemove", (e) => {
      if (isUploadingAvatar || isSaving) {
        e.preventDefault();

        // tránh set lại dialog nếu đang mở sẵn
        setDialog((prev) => {
          if (prev.visible && prev.type === "warning") return prev;
          return {
            visible: true,
            type: "warning",
            title: "Please Wait",
            message: "Please wait until the process is finished.",
            confirmText: "OK",
          };
        });
      }
    });

    return removeListener;
  }, [navigation, isUploadingAvatar, isSaving]);

  // ===== Validation =====
  const isValidPhone = (p: string) => /^[0-9]{9,11}$/.test(p);

  const handleChange = (field: keyof typeof errors, value: string) => {
    if (field === "name") setName(value);
    if (field === "phone") setPhone(value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const canSave = useMemo(() => {
    if (!profile) return false;
    if (isSaving || isUploadingAvatar) return false;
    return true;
  }, [profile, isSaving, isUploadingAvatar]);

  // ===== Save profile =====
  const handleSave = async () => {
    let newErrors = { name: "", phone: "" };
    let hasError = false;

    if (!name.trim()) {
      newErrors.name = "Full name cannot be empty.";
      hasError = true;
    }

    const phoneTrim = phone.trim();
    if (phoneTrim.length > 0 && !isValidPhone(phoneTrim)) {
      newErrors.phone = "Please enter a valid phone number.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsSaving(true);
    try {
      await profileApi.updateProfile({
        name: name.trim(),
        phone: phoneTrim.length === 0 ? null : phoneTrim,
      });

      await fetchProfile({ silent: true });

      openDialog({
        type: "success",
        title: "Success",
        message: "Profile updated successfully!",
        confirmText: "OK",
        onCloseAction: () => router.back(),
      });
    } catch (e: any) {
      const msg = getErrorMessage(e, "Failed to update profile.");
      openDialog({
        type: "error",
        title: "Update Failed",
        message: msg,
        confirmText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ===== Open avatar sheet =====
  const openAvatarPicker = () => {
    if (isUploadingAvatar) return;
    setShowAvatarPicker(true);
  };

  // ===== Receive asset from sheet -> upload =====
  const handleAvatarSelected = async (asset: AvatarAsset) => {
    const payload = normalizeAvatarAsset(asset);

    // optimistic UI
    setAvatarUrl(payload.uri);
    setShowAvatarPicker(false);

    setIsUploadingAvatar(true);
    try {
      await profileApi.updateAvatar(payload);
      await fetchProfile({ silent: true });
    } catch (e: any) {
      // revert UI
      setAvatarUrl(profile?.avatarURL ?? null);

      const msg = getErrorMessage(e, "Upload failed.");
      openDialog({
        type: "error",
        title: "Upload Error",
        message: msg,
        confirmText: "OK",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppDetailHeader title="Edit Profile" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* AVATAR */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <UserAvatar
                initials={(name?.trim()?.charAt(0) || "U").toUpperCase()}
                size={AVATAR_SIZE}
                imageUrl={avatarUrl ?? undefined}
              />

              {isUploadingAvatar && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.editIconBtn,
                  isUploadingAvatar ? styles.editIconBtnDisabled : null,
                ]}
                onPress={openAvatarPicker}
                activeOpacity={0.8}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="pencil" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <AppText size="sm" color={theme.colors.text.secondary} style={{ marginTop: 12 }}>
              Change Profile Picture
            </AppText>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>
            <AppInput
              label="FULL NAME"
              value={name}
              onChangeText={(val) => handleChange("name", val)}
              placeholder="Enter your name"
              icon="person-outline"
              error={errors.name}
            />

            <AppInput
              label="PHONE NUMBER"
              value={phone}
              onChangeText={(val) => handleChange("phone", val)}
              placeholder="Enter phone number"
              icon="call-outline"
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>

          <AppButton
            title={isSaving ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            isLoading={isSaving || storeLoading || isUploadingAvatar}
            disabled={!canSave}
            variant="primary"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <AvatarPickerSheet
        visible={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onImageSelected={handleAvatarSelected}
      />

      {/* ✅ AppDialog cho cả success / error / warning */}
      <AppDialog
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={closeDialog}
        confirmText={dialog.confirmText || "OK"}
        onlyConfirm={true}
      />
    </View>
  );
};

export default EditProfileView;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { padding: theme.spacing.md },

  avatarSection: { alignItems: "center", marginVertical: theme.spacing.lg },
  avatarWrapper: {
    position: "relative",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },

  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  editIconBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#F9FAFB",
    elevation: 2,
  },
  editIconBtnDisabled: { opacity: 0.75 },

  formContainer: {
    backgroundColor: "#fff",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    elevation: 1,
    marginBottom: theme.spacing.lg,
  },
});
