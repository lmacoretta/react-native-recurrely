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
  const [mfaCode, setMfaCode] = useState("");
  const [isMfa, setIsMfa] = useState(false);
  const [mfaStrategy, setMfaStrategy] = useState<string | null>(null);
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

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setErrorMessage(finalizeError.message || "Failed to finalize session.");
          return;
        }

        router.replace("/(tabs)");
        return;
      }

      if (signIn.status === "needs_second_factor") {
        const supported = signIn.supportedSecondFactors || [];
        const phoneFactor = supported.find((f) => f.strategy === "phone_code");
        const emailFactor = supported.find((f) => f.strategy === "email_code");
        const totpFactor = supported.find((f) => f.strategy === "totp");
        const backupFactor = supported.find((f) => f.strategy === "backup_code");

        if (phoneFactor) {
          const { error: sendError } = await signIn.mfa.sendPhoneCode();
          if (sendError) {
            setErrorMessage(sendError.message || "Could not send verification code.");
            return;
          }
          setMfaStrategy("phone_code");
        } else if (emailFactor) {
          const { error: sendError } = await signIn.mfa.sendEmailCode();
          if (sendError) {
            setErrorMessage(sendError.message || "Could not send verification code.");
            return;
          }
          setMfaStrategy("email_code");
        } else if (totpFactor) {
          setMfaStrategy("totp");
        } else if (backupFactor) {
          setMfaStrategy("backup_code");
        } else {
          setErrorMessage("Unsupported second factor method required by your account.");
          return;
        }

        setIsMfa(true);
        return;
      }

      if (signIn.status === "needs_new_password") {
        setErrorMessage("A password reset is required to continue.");
      } else {
        setErrorMessage(`Sign-in cannot be completed (status: ${signIn.status}).`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, emailAddress, password, signIn, router]);

  const handleVerifyMFA = useCallback(async () => {
    if (!isLoaded || !mfaCode.trim()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      let verifyError: { message?: string } | null = null;
      const code = mfaCode.trim();

      if (mfaStrategy === "phone_code") {
        const res = await signIn.mfa.verifyPhoneCode({ code });
        verifyError = res.error;
      } else if (mfaStrategy === "email_code") {
        const res = await signIn.mfa.verifyEmailCode({ code });
        verifyError = res.error;
      } else if (mfaStrategy === "totp") {
        const res = await signIn.mfa.verifyTOTP({ code });
        verifyError = res.error;
      } else if (mfaStrategy === "backup_code") {
        const res = await signIn.mfa.verifyBackupCode({ code });
        verifyError = res.error;
      } else {
        const firstFactor = signIn.supportedSecondFactors?.[0];
        if (firstFactor?.strategy === "totp") {
          const res = await signIn.mfa.verifyTOTP({ code });
          verifyError = res.error;
        } else if (firstFactor?.strategy === "phone_code") {
          const res = await signIn.mfa.verifyPhoneCode({ code });
          verifyError = res.error;
        } else if (firstFactor?.strategy === "email_code") {
          const res = await signIn.mfa.verifyEmailCode({ code });
          verifyError = res.error;
        } else if (firstFactor?.strategy === "backup_code") {
          const res = await signIn.mfa.verifyBackupCode({ code });
          verifyError = res.error;
        } else {
          setErrorMessage("No valid second factor verification method found.");
          return;
        }
      }

      if (verifyError) {
        setErrorMessage(verifyError.message || "Invalid verification code.");
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setErrorMessage(finalizeError.message || "Failed to finalize session.");
          return;
        }

        router.replace("/(tabs)");
      } else {
        setErrorMessage(`Sign-in incomplete (status: ${signIn.status}).`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, mfaCode, mfaStrategy, signIn, router]);

  const isFormValid = emailAddress.trim().length > 0 && password.length > 0;
  const isMfaValid = mfaCode.trim().length > 0;

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
            title={isMfa ? "Two-factor verification" : "Welcome back"}
            subtitle={
              isMfa
                ? mfaStrategy === "totp"
                  ? "Enter the code from your authenticator app"
                  : mfaStrategy === "phone_code"
                  ? "Enter the verification code sent to your phone"
                  : mfaStrategy === "email_code"
                  ? "Enter the verification code sent to your email"
                  : "Enter your verification or backup code"
                : "Sign in to continue managing your subscriptions"
            }
          />

          {/* Form Card */}
          <View className="auth-card">
            <View className="auth-form">
              {!isMfa ? (
                <>
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
                </>
              ) : (
                <>
                  {/* MFA Code Field */}
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className={clsx("auth-input", errorMessage && "auth-input-error")}
                      placeholder="Enter 6-digit or backup code"
                      placeholderTextColor="rgba(8, 17, 38, 0.4)"
                      value={mfaCode}
                      onChangeText={(text) => {
                        setMfaCode(text);
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
                      (!isMfaValid || loading || !isLoaded) && "auth-button-disabled"
                    )}
                    onPress={handleVerifyMFA}
                    disabled={!isMfaValid || loading || !isLoaded}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="auth-button-text">Verify & Continue</Text>
                    )}
                  </TouchableOpacity>

                  {/* Back to password sign-in */}
                  <TouchableOpacity
                    className="mt-3 items-center py-2"
                    onPress={() => {
                      setIsMfa(false);
                      setMfaCode("");
                      if (errorMessage) setErrorMessage("");
                    }}
                    disabled={loading}
                  >
                    <Text className="auth-link">Back to sign in</Text>
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
