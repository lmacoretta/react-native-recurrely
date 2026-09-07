import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignIn() {
  return (
    <View>
      <Text>Sign In</Text>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Sign Up
      </Link>
      <Link
        href="/(tabs)"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Home
      </Link>
    </View>
  );
}
