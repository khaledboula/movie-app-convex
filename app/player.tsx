import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Pressable, Text } from "@/components/ui";
import { WebView } from "react-native-webview";
import { X } from "lucide-react-native";
import { Platform } from "react-native";
import { useAuth } from "@/hooks/use-auth";

export default function PlayerPage() {
  const { url, title } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  const isPremiumUser = user?.email === "sarashowslife@gmail.com";
  const isSubscribed = user?.subscriptionStatus && user.subscriptionStatus !== "none";

  useEffect(() => {
    if (isPremiumUser || isSubscribed) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/(tabs)/payment");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPremiumUser, isSubscribed, router]);

  if (Platform.OS === "web") {
    return (
      <View className="flex-1 bg-black">
        <View className="absolute top-10 left-6 z-50 flex-row items-center">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4"
          >
            <X className="text-white w-6 h-6" />
          </Pressable>
          <Text className="text-white font-bold text-lg">{title}</Text>
          {(!isPremiumUser && !isSubscribed) && (
            <View className="ml-auto mr-6 bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
              <Text className="text-primary text-xs font-bold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} left
              </Text>
            </View>
          )}
        </View>
        <iframe
          src={url as string}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="absolute top-12 left-6 z-50 flex-row items-center">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4"
        >
          <X className="text-white w-6 h-6" />
        </Pressable>
        <Text className="text-white font-bold text-lg">{title}</Text>
        {(!isPremiumUser && !isSubscribed) && (
          <View className="ml-auto mr-6 bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
            <Text className="text-primary text-xs font-bold">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} left
            </Text>
          </View>
        )}
      </View>
      <WebView
        source={{ uri: url as string }}
        className="flex-1"
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}
