import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import "@/global.css";
import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !emailAddress.trim() || !password) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Could not create account.");
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setErrorMessage(sendError.message || "Could not send verification code.");
        return;
      }

      setIsVerifying(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, emailAddress, password, signUp]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded || !code.trim()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (error) {
        setErrorMessage(error.message || "Invalid verification code.");
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setErrorMessage(finalizeError.message || "Failed to finalize session.");
        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signUp, router]);

  const isFormValid = emailAddress.trim().length > 0 && password.length >= 8;

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
            title={isVerifying ? "Verify Email" : "Create account"}
            subtitle={
              isVerifying
                ? `Enter the code sent to ${emailAddress}`
                : "Join Recurly to start managing your subscriptions"
            }
          />

          {/* Form Card */}
          <View className="auth-card">
            <View className="auth-form">
              {!isVerifying ? (
                <>
                  {/* Email Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errorMessage && "auth-input-error"
                      )}
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
                      className={clsx(
                        "auth-input",
                        errorMessage && "auth-input-error"
                      )}
                      placeholder="Create a password (min 8 chars)"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errorMessage) setErrorMessage("");
                      }}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
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
                      (!isFormValid || loading || !isLoaded) &&
                      "auth-button-disabled"
                    )}
                    onPress={handleSignUp}
                    disabled={!isFormValid || loading || !isLoaded}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="auth-button-text">Sign up</Text>
                    )}
                  </TouchableOpacity>

                  {/* Navigation to Sign In */}
                  <View className="auth-link-row">
                    <Text className="auth-link-copy">Already have an account?</Text>
                    <Link href="/(auth)/sign-in" asChild>
                      <TouchableOpacity activeOpacity={0.7}>
                        <Text className="auth-link">Sign in</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </>
              ) : (
                <>
                  {/* Verification Code Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errorMessage && "auth-input-error"
                      )}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      value={code}
                      onChangeText={(text) => {
                        setCode(text);
                        if (errorMessage) setErrorMessage("");
                      }}
                      keyboardType="number-pad"
                      editable={!loading}
                    />
                  </View>

                  {/* Error Message */}
                  {errorMessage ? (
                    <Text className="auth-error">{errorMessage}</Text>
                  ) : null}

                  {/* Verify Button */}
                  <TouchableOpacity
                    className={clsx(
                      "auth-button",
                      (!code.trim() || loading || !isLoaded) &&
                      "auth-button-disabled"
                    )}
                    onPress={handleVerify}
                    disabled={!code.trim() || loading || !isLoaded}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="auth-button-text">Verify & Continue</Text>
                    )}
                  </TouchableOpacity>

                  {/* Resend / Edit info option */}
                  <TouchableOpacity
                    className="mt-3 items-center py-2"
                    onPress={() => setIsVerifying(false)}
                    disabled={loading}
                  >
                    <Text className="auth-link">Back to edit email</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
