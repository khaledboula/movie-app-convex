import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, View, Text, Pressable, FlatList, Spinner } from "@/components/ui";
import { ChevronLeft } from "lucide-react-native";
import { MovieCard } from "@/components/movie-card";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CategoryScreen() {
  const { title, type, mediaType, genreId, timeWindow } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getTrending = useAction(api.tmdb.getTrending);
  const getPopular = useAction(api.tmdb.getPopular);
  const getTopRated = useAction(api.tmdb.getTopRated);
  const getDiscover = useAction(api.tmdb.getDiscover);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        let result;
        const params: any = { mediaType: mediaType as string };

        switch (type) {
          case "trending":
            result = await getTrending({ mediaType: mediaType as string, timeWindow: (timeWindow as string) || "day" });
            break;
          case "popular":
            result = await getPopular(params);
            break;
          case "top_rated":
            result = await getTopRated(params);
            break;
          case "discover":
            if (genreId) params.genreId = parseInt(genreId as string);
            result = await getDiscover(params);
            break;
          default:
            result = { results: [] };
        }

        setData(result.results || []);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryData();
  }, [type, mediaType, genreId, timeWindow]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      <View className="flex-row items-center px-6 py-4 border-b border-white/5">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4"
        >
          <ChevronLeft className="text-white w-6 h-6" />
        </Pressable>
        <Text className="text-white text-xl font-bold italic uppercase tracking-wider">{title}</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <View className="flex-1 px-2 mb-4">
              <MovieCard
                id={item.id}
                title={item.title || item.name}
                posterPath={item.poster_path}
                rating={item.vote_average}
                mediaType={item.media_type || (mediaType as string)}
                width={160}
              />
            </View>
          )}
          contentContainerClassName="px-4 py-6"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-500">No items found in this category.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
