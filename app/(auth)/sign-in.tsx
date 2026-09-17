import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import "@/global.css";
import { useAuth, useSignIn } from "@clerk/expo";
import clsx from "clsx";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !emailAddress.trim() || !password) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await signIn.password({
        identifier: emailAddress.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid credentials.");
        return;
      }

      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setErrorMessage(finalizeError.message || "Failed to finalize session.");
        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, emailAddress, password, signIn, router]);

  const isFormValid = emailAddress.trim().length > 0 && password.length > 0;

  return (
    <SafeAreaView
      className="auth-safe-area p-5"
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerClassName="auth-content justify-center"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand & Titles */}
          <AuthBrandHeader
            title="Welcome back"
            subtitle="Sign in to continue managing your subscriptions"
          />

          {/* Form Card */}
          <View className="auth-card">
            <View className="auth-form">
              {/* Email Field */}
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className={clsx("auth-input", errorMessage && "auth-input-error")}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  value={emailAddress}
                  onChangeText={(text) => {
                    setEmailAddress(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!loading}
                />
              </View>

              {/* Password Field */}
              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className={clsx("auth-input", errorMessage && "auth-input-error")}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  editable={!loading}
                />
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <Text className="auth-error">{errorMessage}</Text>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                className={clsx(
                  "auth-button",
                  (!isFormValid || loading || !isLoaded) && "auth-button-disabled"
                )}
                onPress={handleSignIn}
                disabled={!isFormValid || loading || !isLoaded}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </TouchableOpacity>

              {/* Navigation to Sign Up */}
              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text className="auth-link">Create an account</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
