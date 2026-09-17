import React, { memo } from "react";
import { Text, View } from "react-native";

interface SettingsItemRowProps {
  label: string;
  value: string;
  truncate?: boolean;
}

const SettingsItemRow = memo(function SettingsItemRow({
  label,
  value,
  truncate = false,
}: SettingsItemRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm font-sans-medium text-muted-foreground">
        {label}
      </Text>
      <Text
        numberOfLines={truncate ? 1 : undefined}
        ellipsizeMode={truncate ? "tail" : undefined}
        className="text-sm font-sans-semibold text-primary max-w-[200px] text-right"
      >
        {value || "—"}
      </Text>
    </View>
  );
});

export default SettingsItemRow;
