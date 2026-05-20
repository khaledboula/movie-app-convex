import React from "react";
import { SafeAreaView, ScrollView, View, Text, Pressable } from "@/components/ui";
import { ChevronLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function LegalPage() {
  const { title } = useLocalSearchParams();
  const router = useRouter();

  const content = {
    "Privacy Policy": "Your privacy is important to us. Cineverse+ does not share your data with third parties. We only store your language preferences and watch history to improve your experience.",
    "Terms of Service": "By using Cineverse+, you agree to use the platform for entertainment discovery only. We do not host any copyrighted content.",
    "DMCA": "Cineverse+ is a metadata provider and indexing service. If you believe your copyrighted work is being linked to without authorization, please contact us.",
    "Disclaimer": "Cineverse+ does not host or upload media files. All metadata is provided by TMDb APIs. Embedded players belong to third-party providers.",
    "Contact": "For support or legal inquiries, please email: legal@cineverse.plus"
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      <View className="px-6 py-4 flex-row items-center border-b border-white/5">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ChevronLeft color="white" />
        </Pressable>
        <Text variant="h3" className="text-white font-bold">{title || "Legal"}</Text>
      </View>
      <ScrollView className="flex-1 p-6">
        <Text className="text-gray-400 leading-7 text-lg">
          {content[title as keyof typeof content] || "Legal information for Cineverse+."}
        </Text>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
