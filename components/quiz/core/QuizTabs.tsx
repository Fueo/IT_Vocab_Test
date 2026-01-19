import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import theme from "../../../theme"; // Import theme chứa colors của bạn
import { AppText } from "../../core";

export type QuizTabKey = "TOPIC" | "RANDOM";

const TABS: { key: QuizTabKey; label: string }[] = [
  { key: "TOPIC", label: "Theo Topic" },
  { key: "RANDOM", label: "Random" },
];

type Props = {
  value: QuizTabKey;
  onChange: (key: QuizTabKey) => void;
};

const QuizTabs: React.FC<Props> = ({ value, onChange }) => {
  // Lấy màu từ theme bạn cung cấp
  const GRADIENT_COLORS = theme.colors.slides.step1; // ['#4CD964', '#28B9D6']
  const CONTAINER_BG = theme.colors.primaryLight;    // 'rgba(91, 194, 54, 0.15)'
  const INACTIVE_TEXT = theme.colors.text.secondary; // '#6B7280'

  return (
    <View style={[styles.tabContainer, { backgroundColor: CONTAINER_BG }]}>
      {TABS.map((t) => {
        const isActive = value === t.key;

        return (
          <TouchableOpacity
            key={t.key}
            style={styles.touchableWrapper}
            onPress={() => onChange(t.key)}
            activeOpacity={0.8}
          >
            {isActive ? (
              // ✅ Nút Active: Dùng LinearGradient
              <LinearGradient
                colors={GRADIENT_COLORS as [string, string]} // Ép kiểu để TS không báo lỗi
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }} // Gradient chạy ngang từ trái sang phải
                style={styles.activeGradient}
              >
                <AppText size="sm" weight="bold" color="white">
                  {t.label}
                </AppText>
              </LinearGradient>
            ) : (
              // ⚪ Nút Inactive: View trong suốt bình thường
              <View style={styles.inactiveView}>
                <AppText size="sm" weight="medium" color={INACTIVE_TEXT}>
                  {t.label}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    borderRadius: 30, // Bo tròn nhiều hơn chút cho mềm mại
    padding: 4,
    marginTop: 16, // tương đương theme.spacing.md
    width: "80%",
    alignSelf: "center",
  },
  touchableWrapper: {
    flex: 1,
    borderRadius: 26, // Nhỏ hơn container một chút
    overflow: "hidden", // Để gradient không bị tràn ra ngoài bo góc
  },
  activeGradient: {
    flex: 1,
    paddingVertical: 10, // Tăng chiều cao nút lên một chút cho đẹp
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    // Shadow cho nút nổi lên
    shadowColor: "#28B9D6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  inactiveView: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});

export default QuizTabs;