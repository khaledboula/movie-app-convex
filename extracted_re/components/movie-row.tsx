import React from "react";
import { View, Text, FlatList, Pressable } from "@/components/ui";
import { MovieCard } from "./movie-card";
import { useRouter } from "expo-router";

interface MovieRowProps {
  title: string;
  data: any[];
  mediaType?: string;
  categoryParams?: {
    type: string;
    mediaType: string;
    genreId?: number;
    timeWindow?: string;
  };
}

export function MovieRow({ title, data, mediaType = "movie", categoryParams }: MovieRowProps) {
  const router = useRouter();
  if (!data || data.length === 0) return null;

  const handleViewAll = () => {
    if (categoryParams) {
      router.push({
        pathname: "/category",
        params: { 
          title,
          ...categoryParams
        }
      });
    }
  };

  return (
    <View className="mb-8">
      <View className="px-6 mb-4 flex-row items-center justify-between">
        <Text className="text-red-600 text-xl font-bold tracking-wide uppercase italic">
          {title}
        </Text>
        <Pressable onPress={handleViewAll}>
          <Text variant="small" className="text-gray-500 font-semibold uppercase tracking-tighter">
            View All
          </Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: { item: any }) => (
          <MovieCard
            id={item.id}
            title={item.title || item.name}
            posterPath={item.poster_path}
            rating={item.vote_average}
            mediaType={item.media_type || mediaType}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-6"
      />
    </View>
  );
}
