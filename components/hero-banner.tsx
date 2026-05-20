import React from "react";
import { View, Text, Pressable } from "@/components/ui";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Info, Plus } from "lucide-react-native";
import { Link } from "expo-router";
import { useLanguage } from "@/hooks/use-language";

interface HeroBannerProps {
  movie: any;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  const { t } = useLanguage();
  if (!movie) return null;

  return (
    <View className="h-[650px] w-full relative">
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/original${movie.poster_path}` }}
        contentFit="cover"
        className="w-full h-full"
        transition={1000}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent", "rgba(0,0,0,0.6)", "black"]}
        className="absolute inset-0"
      />
      <View className="absolute bottom-16 left-0 right-0 items-center px-8">
        <View className="bg-red-600 px-3 py-1 rounded-md mb-4 shadow-lg shadow-red-600/40 border border-red-600/50">
          <Text className="text-white text-[10px] font-black tracking-[4px] uppercase italic">New Release</Text>
        </View>
        <Text variant="h1" className="text-white text-center mb-3 font-black uppercase italic tracking-tighter text-5xl leading-[48px]">
          {movie.title || movie.name}
        </Text>
        <View className="flex-row items-center gap-2 mb-6">
          <Text className="text-red-600 font-bold">{movie.vote_average?.toFixed(1)} IMDb</Text>
          <View className="w-1 h-1 bg-gray-500 rounded-full" />
          <Text className="text-gray-300 font-medium">{(movie.release_date || movie.first_air_date)?.split("-")[0]}</Text>
          <View className="w-1 h-1 bg-gray-500 rounded-full" />
          <Text className="text-gray-300 font-medium">{movie.media_type === "tv" ? "TV Show" : "Movie"}</Text>
        </View>
        
        <View className="flex-row gap-4 w-full">
          <Link href={`/watch/${movie.media_type || "movie"}/${movie.id}`} asChild>
            <Pressable className="flex-1 bg-white h-14 rounded-2xl flex-row items-center justify-center shadow-2xl active:scale-95 transition-transform">
              <Play className="w-5 h-5 text-black fill-black mr-2" />
              <Text className="text-black font-black text-lg">{t("watchNow")}</Text>
            </Pressable>
          </Link>
          <Pressable className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center backdrop-blur-xl border border-white/10 active:scale-95 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
