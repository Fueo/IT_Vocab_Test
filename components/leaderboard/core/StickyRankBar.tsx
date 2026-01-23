import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import theme from "../../../theme";
import { AppText } from "../../core";
import { TabKey } from "./leaderboard.types";

type Props = {
    selectedTab: TabKey;

    // ✅ data mới
    position: number | null;      // BE trả về res.position
    displayName?: string | null;  // ví dụ: "Guest User" hoặc user name
    meValue?: number | null;      // XP hoặc Streak của bạn
};

const StickyRankBar: React.FC<Props> = ({
    selectedTab,
    position,
    displayName,
    meValue,
}) => {
    const unit = selectedTab === "XP" ? "XP" : "Days";

    const valueText =
        meValue == null
            ? "—"
            : selectedTab === "XP"
                ? meValue.toLocaleString()
                : String(meValue);

    const rankText = position == null ? "—" : String(position);

    return (
        <View style={styles.floatingRankWrapper}>
            <LinearGradient
                colors={theme.colors.slides.step1 as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.floatingRankContainer}
            >
                <View style={[styles.rankCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                    <AppText weight="bold" color="white">
                        {rankText}
                    </AppText>
                </View>

                <View style={styles.itemContent}>
                    <AppText weight="bold" color="white" size="md">
                        Your Position
                    </AppText>
                    <AppText size="xs" color="rgba(255,255,255,0.8)">
                        {displayName ?? "Guest User"}
                    </AppText>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                    <AppText weight="bold" color="white" size="lg">
                        {valueText}
                    </AppText>
                    <AppText size="xs" color="rgba(255,255,255,0.8)">
                        {unit}
                    </AppText>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingRankWrapper: {
        position: "absolute",
        bottom: 20,
        left: theme.spacing.md,
        right: theme.spacing.md,
        elevation: 8,
    },
    floatingRankContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: theme.spacing.md,
        borderRadius: theme.radius.xl,
    },
    rankCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: theme.spacing.md,
    },
    itemContent: {
        flex: 1,
        marginHorizontal: theme.spacing.sm,
    },
});

export default StickyRankBar;
