import React from "react";
import { SafeAreaView, View, Text, Input, FlatList, Spinner, Pressable, ScrollView } from "@/components/ui";
import { Search as SearchIcon, X, SlidersHorizontal, Star, Calendar, Film, Monitor } from "lucide-react-native";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { useLanguage } from "@/hooks/use-language";
import { Logo } from "@/components/logo";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 18, name: "Drama" },
  { id: 16, name: "Anime" },
  { id: 35, name: "Comedy" },
  { id: 53, name: "Thriller" },
];

const MEDIA_TYPES = [
  { id: "movie", name: "Movies" },
  { id: "tv", name: "TV Shows" },
];

export default function SearchScreen() {
  const { t, isRTL } = useLanguage();
  const searchMedia = useAction(api.tmdb.searchMedia);
  const getDiscover = useAction(api.tmdb.getDiscover);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeGenre, setActiveGenre] = React.useState<number | null>(null);
  const [activeMediaType, setActiveMediaType] = React.useState<string>("movie");

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const data: any = await searchMedia({ query: text });
        setResults((data as any).results?.filter((i: any) => i.poster_path && (i.title || i.name)) || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    } else if (text.length === 0 && activeGenre) {
      fetchFiltered();
    } else {
      setResults([]);
    }
  };

  const fetchFiltered = async () => {
    setLoading(true);
    try {
      const data = await getDiscover({ 
        mediaType: activeMediaType, 
        genreId: activeGenre ?? undefined 
      });
      setResults((data as any).results?.filter((i: any) => i.poster_path) || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (query.length === 0 && (activeGenre || activeMediaType)) {
      fetchFiltered();
    }
  }, [activeGenre, activeMediaType]);

  const SearchResultCard = ({ item }: { item: any }) => (
    <Link href={`/watch/${item.media_type || activeMediaType}/${item.id}`} asChild>
      <Pressable className="flex-1 m-2 active:scale-[0.98] transition-all">
        <View className="bg-white/5 rounded-[24px] overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
          <View className="aspect-[2/3] relative">
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
              contentFit="cover"
              className="w-full h-full"
              transition={300}
            />
            <View className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded-xl flex-row items-center border border-white/10">
              <Star size={12} className="text-yellow-500 fill-yellow-500 mr-1" />
              <Text className="text-[10px] font-black text-white">{item.vote_average?.toFixed(1)}</Text>
            </View>
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="bg-red-600 px-2 py-0.5 rounded-md">
                  <Text className="text-[8px] font-black uppercase text-white tracking-tighter">
                    {item.media_type === 'tv' || activeMediaType === 'tv' ? 'TV' : 'Movie'}
                  </Text>
                </View>
                <Text className="text-gray-400 text-[10px] font-bold">
                  {(item.release_date || item.first_air_date)?.split('-')[0]}
                </Text>
              </View>
              <Text className="text-white font-bold text-sm leading-tight" numberOfLines={2}>
                {item.title || item.name}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Logo size="md" />
          <Pressable 
            onPress={() => setShowFilters(!showFilters)}
            className={`w-12 h-12 rounded-2xl items-center justify-center border ${showFilters ? 'bg-red-600 border-red-600 shadow-lg shadow-red-600/40' : 'bg-white/5 border-white/10'}`}
          >
            <SlidersHorizontal size={20} color="white" />
          </Pressable>
        </View>
        
        <View className="relative mb-4">
          <Input
            placeholder={t("searchPlaceholder")}
            value={query}
            onChangeText={handleSearch}
            className="pl-14 bg-white text-black h-14 rounded-2xl font-bold shadow-2xl"
            placeholderTextColor="#999"
          />
          <SearchIcon className="absolute left-5 top-4.5 w-5 h-5 text-gray-400" />
          {query.length > 0 && (
            <Pressable 
              onPress={() => handleSearch("")}
              className="absolute right-5 top-4.5"
            >
              <X className="w-5 h-5 text-gray-400" />
            </Pressable>
          )}
        </View>

        {showFilters && (
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                {MEDIA_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    onPress={() => setActiveMediaType(type.id)}
                    className={`px-6 py-2.5 rounded-xl border flex-row items-center gap-2 ${activeMediaType === type.id ? 'bg-white border-white' : 'bg-white/5 border-white/10'}`}
                  >
                    {type.id === 'movie' ? <Film size={14} color={activeMediaType === type.id ? 'black' : 'white'} /> : <Monitor size={14} color={activeMediaType === type.id ? 'black' : 'white'} />}
                    <Text className={`font-black uppercase tracking-tighter text-[10px] ${activeMediaType === type.id ? 'text-black' : 'text-white'}`}>
                      {type.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setActiveGenre(null)}
                  className={`px-6 py-2.5 rounded-xl border ${activeGenre === null ? 'bg-red-600 border-red-600' : 'bg-white/5 border-white/10'}`}
                >
                  <Text className="text-white font-black uppercase tracking-tighter text-[10px]">All Genres</Text>
                </Pressable>
                {GENRES.map((genre) => (
                  <Pressable
                    key={genre.id}
                    onPress={() => setActiveGenre(genre.id)}
                    className={`px-6 py-2.5 rounded-xl border ${activeGenre === genre.id ? 'bg-red-600 border-red-600 shadow-lg shadow-red-600/40' : 'bg-white/5 border-white/10'}`}
                  >
                    <Text className="text-white font-black uppercase tracking-tighter text-[10px]">{genre.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Spinner color="#E50914" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: any) => `${item.id}-${item.media_type || activeMediaType}`}
          numColumns={2}
          renderItem={({ item }: { item: any }) => <SearchResultCard item={item} />}
          contentContainerClassName="px-4 pb-32"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20 px-10">
              <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center mb-6">
                <SearchIcon size={40} className="text-gray-700" />
              </View>
              <Text className="text-white text-xl font-black italic uppercase tracking-tighter text-center mb-2">
                Discover More
              </Text>
              <Text className="text-gray-500 text-center text-sm font-medium">
                Try searching for a movie, TV show, or use the filters above to find something new.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
