import React from "react";
import { Pressable, View, Text } from "@/components/ui";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Star } from "lucide-react-native";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  rating: number;
  mediaType: string;
  width?: number | string;
}

export function MovieCard({ id, title, posterPath, rating, mediaType, width = 128 }: MovieCardProps) {
  const containerStyle = typeof width === 'number' ? { width } : {};
  const containerClass = typeof width === 'string' ? width : '';

  return (
    <Link href={`/watch/${mediaType}/${id}`} asChild>
      <Pressable 
        style={containerStyle}
        className={`mr-4 active:scale-95 transition-transform ${containerClass}`}
      >
        <View className="rounded-xl overflow-hidden bg-muted aspect-[2/3] relative shadow-lg">
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${posterPath}` }}
            contentFit="cover"
            className="w-full h-full"
            transition={300}
          />
          <View className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded-md flex-row items-center">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
            <Text className="text-[10px] font-bold text-white">
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <Text variant="small" className="mt-2 font-semibold line-clamp-1 text-foreground">
          {title}
        </Text>
      </Pressable>
    </Link>
  );
}
