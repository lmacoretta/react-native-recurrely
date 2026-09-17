import React from "react";
import { Text, View } from "react-native";

interface AuthBrandHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthBrandHeader = React.memo(function AuthBrandHeader({
  title,
  subtitle,
}: AuthBrandHeaderProps) {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text text-white">R</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Recurly</Text>
          <Text className="auth-wordmark-sub">SMART BILLING</Text>
        </View>
      </View>

      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );
});

export default AuthBrandHeader;
