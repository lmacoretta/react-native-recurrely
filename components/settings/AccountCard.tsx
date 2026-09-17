import React, { memo } from "react";
import { Text, View } from "react-native";
import SettingsItemRow from "./SettingsItemRow";

interface AccountCardProps {
  accountId: string;
  joinedDate: string;
}

const AccountCard = memo(function AccountCard({
  accountId,
  joinedDate,
}: AccountCardProps) {
  return (
    <View className="rounded-3xl border border-border bg-card p-5 gap-4">
      <Text className="text-base font-sans-bold text-primary">Account</Text>

      <SettingsItemRow
        label="Account ID"
        value={accountId}
        truncate
      />

      <SettingsItemRow
        label="Joined"
        value={joinedDate}
      />
    </View>
  );
});

export default AccountCard;
