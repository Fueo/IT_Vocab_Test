import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import theme from "../../../theme";
import AppText from "../../core/AppText";

type Props = {
  value: string;
  onChange: (text: string) => void;
  length: number;              // số ô _ _ _ _
  editable?: boolean;
  autoFocus?: boolean;
  keyboardType?: "default" | "number-pad";
  allowSpaces?: boolean;       // nếu muốn cho phép khoảng trắng
};

const FillBlankCellsInput: React.FC<Props> = ({
  value,
  onChange,
  length,
  editable = true,
  autoFocus = false,
  keyboardType = "default",
  allowSpaces = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const cursorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blinking = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    blinking.start();
    return () => blinking.stop();
  }, [cursorOpacity]);

  const normalized = useMemo(() => {
    let t = String(value || "");

    // optional: loại bỏ ký tự không mong muốn
    if (!allowSpaces) t = t.replace(/\s+/g, "");
    // cắt đúng số ô
    if (t.length > length) t = t.slice(0, length);

    return t;
  }, [value, allowSpaces, length]);

  useEffect(() => {
    // giữ onChange sync nếu value vượt length
    if (normalized !== value) onChange(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized]);

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < length; i++) {
      const ch = normalized[i];
      const isFocused = i === normalized.length;

      cells.push(
        <View
          key={i}
          style={[
            styles.cell,
            isFocused && editable ? styles.cellFocused : null,
            ch ? styles.cellFilled : null,
          ]}
        >
          {ch ? (
            <AppText size="sm" weight="bold" color={theme.colors.text.primary}>
              {ch}
            </AppText>
          ) : (
            isFocused &&
            editable && <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
          )}
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.cellContainer}
        onPress={() => editable && inputRef.current?.focus()}
      >
        {renderCells()}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={normalized}
        editable={editable}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => {
          let t = String(text || "");
          if (!allowSpaces) t = t.replace(/\s+/g, "");

          // cho phép chữ/số/dấu gạch dưới/… => nếu bạn muốn strict hơn thì sửa regex
          // t = t.replace(/[^a-zA-Z0-9]/g, "");

          if (t.length > length) t = t.slice(0, length);
          onChange(t);
        }}
        style={styles.hiddenInput}
        caretHidden
        maxLength={length}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: theme.spacing.md },
  cellContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  cell: {
    width: 45,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cellFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  cellFilled: {
    borderColor: theme.colors.text.primary,
    backgroundColor: "#F9FAFB",
  },
  cursor: { width: 2, height: 24, backgroundColor: theme.colors.primary, borderRadius: 1 },
  hiddenInput: { position: "absolute", width: "100%", height: "100%", opacity: 0 },
});

export default FillBlankCellsInput;
