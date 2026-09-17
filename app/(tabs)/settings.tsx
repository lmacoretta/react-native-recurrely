import AccountCard from "@/components/settings/AccountCard";
import SignOutButton from "@/components/settings/SignOutButton";
import UserProfileCard from "@/components/settings/UserProfileCard";
import "@/global.css";
import { useAuth, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userName = useMemo(() => {
    if (!user) return "";
    return (
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
      ""
    );
  }, [user]);

  const userEmail = useMemo(() => {
    return (
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      ""
    );
  }, [user]);

  const accountId = useMemo(() => {
    return user?.id || "";
  }, [user]);

  const joinedDate = useMemo(() => {
    return user?.createdAt
      ? dayjs(user.createdAt).format("DD. MM. YYYY.")
      : "";
  }, [user]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error: any) {
      console.error("Error signing out:", error);
      const errorMessage =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "An error occurred while signing out. Please try again.";
      Alert.alert("Sign Out Failed", errorMessage);
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut, router]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-32 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>

        <UserProfileCard
          name={userName}
          email={userEmail}
          imageUrl={user?.imageUrl}
        />

        <AccountCard accountId={accountId} joinedDate={joinedDate} />

        <SignOutButton onPress={handleSignOut} loading={isSigningOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

