import React, { memo } from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface SignOutButtonProps {
  onPress: () => Promise<void> | void;
  loading?: boolean;
}

const SignOutButton = memo(function SignOutButton({
  onPress,
  loading = false,
}: SignOutButtonProps) {
  return (
    <TouchableOpacity
      className="w-full items-center justify-center rounded-2xl bg-accent py-4"
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#081126" />
      ) : (
        <Text className="text-base font-sans-bold text-primary">Sign Out</Text>
      )}
    </TouchableOpacity>
  );
});

export default SignOutButton;
