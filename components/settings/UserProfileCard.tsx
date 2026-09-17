import React, { memo, useState } from "react";
import { Image, Text, View } from "react-native";

interface UserProfileCardProps {
  name?: string;
  email?: string;
  imageUrl?: string | null;
}

const UserProfileCard = memo(function UserProfileCard({
  name,
  email,
  imageUrl,
}: UserProfileCardProps) {
  const [imageError, setImageError] = useState(false);

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : "U";

  return (
    <View className="flex-row items-center gap-4 rounded-3xl border border-border bg-card p-5">
      <View className="size-16 items-center justify-center overflow-hidden rounded-2xl bg-white border border-border/40">
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            className="size-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text className="text-2xl font-sans-bold text-accent">{initial}</Text>
        )}
      </View>

      <View className="flex-1 justify-center">
        {name ? (
          <Text numberOfLines={1} className="text-xl font-sans-bold text-primary">
            {name}
          </Text>
        ) : null}
        {email ? (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="mt-0.5 text-sm font-sans-medium text-muted-foreground"
          >
            {email}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

export default UserProfileCard;

