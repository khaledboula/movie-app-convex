import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, ScrollView, View, Text, Pressable, Spinner } from "@/components/ui";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Play, ChevronLeft, Star, Plus, Share2, X } from "lucide-react-native";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MovieRow } from "@/components/movie-row";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Alert, Platform, Share } from "react-native";

export default function WatchPage() {
  const { type, id } = useLocalSearchParams();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { userId } = useAuth();
  const getDetails = useAction(api.tmdb.getDetails);
  const addToHistory = useMutation(api.tmdb.addToHistory);
  const toggleWatchlist = useMutation(api.tmdb.toggleWatchlist);
  
  const [details, setDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");

  const showAlert = (title: string, message: string) => {
    setToastMessage(`${title}: ${message}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    if (Platform.OS !== "web") {
      Alert.alert(title, message);
    }
  };

  const handleShare = async () => {
    try {
      const movieTitle = details.title || details.name;
      const movieUrl = Platform.OS === 'web' 
        ? window.location.href 
        : `https://cineverse.plus/watch/${type}/${id}`;

      if (Platform.OS === 'web' && navigator.share) {
        try {
          await navigator.share({
            title: movieTitle,
            text: `Check out ${movieTitle} on Cineverse+!`,
            url: movieUrl,
          });
          return;
        } catch (shareError: any) {
          // If permission is denied or share fails, fall through to clipboard fallback
          console.log("Navigator share failed, falling back to clipboard", shareError);
          if (shareError.name === 'AbortError') return;
        }
      }

      if (Platform.OS === 'web') {
        // Fallback for browsers that don't support navigator.share or where it's restricted
        try {
          await navigator.clipboard.writeText(movieUrl);
          showAlert("Link Copied", "The link has been copied to your clipboard.");
        } catch (clipboardError) {
          console.error("Clipboard fallback failed", clipboardError);
        }
      } else {
        const result = await Share.share({
          message: `Check out ${movieTitle} on Cineverse+! ${movieUrl}`,
          url: movieUrl,
          title: movieTitle,
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        showAlert("Error", error.message);
      }
    }
  };

  React.useEffect(() => {
    async function fetchDetails() {
      try {
        const data = await getDetails({ 
          mediaType: type as string, 
          id: parseInt(id as string) 
        });
        setDetails(data);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id, type]);

  const handlePlay = async () => {
    const imdbId = details?.imdb_id || details?.external_ids?.imdb_id;
    if (imdbId) {
      if (userId) {
        await addToHistory({
          userId,
          mediaId: details.id,
          mediaType: type as string,
          title: details.title || details.name,
          posterPath: details.poster_path,
        });
      }
      
      const url = `https://streamimdb.ru/embed/${type}/${imdbId}`;
      router.push({
        pathname: "/player",
        params: { url, title: details.title || details.name }
      });
    } else {
      showAlert("Not Available", "Stream not available for this title yet.");
    }
  };

  const handleToggleWatchlist = async () => {
    if (!userId) {
      showAlert("Auth Required", "Please sign in to manage your watchlist.");
      return;
    }
    try {
      await toggleWatchlist({
        userId,
        mediaId: details.id,
        mediaType: type as string,
        title: details.title || details.name,
        posterPath: details.poster_path,
        rating: details.vote_average,
      });
      showAlert("Success", "Watchlist updated!");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Spinner size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      {/* Custom Toast Notification */}
      {showToast && (
        <View className="absolute top-10 left-6 right-6 z-[100] bg-red-600 px-6 py-4 rounded-2xl flex-row items-center shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Text className="text-white font-black italic uppercase tracking-tighter flex-1">{toastMessage}</Text>
          <Pressable onPress={() => setShowToast(false)}>
            <X className="text-white w-5 h-5 ml-4" />
          </Pressable>
        </View>
      )}

      <ScrollView className="flex-1">
        {/* Immersive Backdrop */}
        <View className="h-[450px] w-full relative">
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/original${details.backdrop_path}` }}
            contentFit="cover"
            className="w-full h-full"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)", "black"]}
            className="absolute inset-0"
          />
          <Pressable 
            onPress={() => router.back()}
            className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-12 h-12 rounded-full bg-black/40 items-center justify-center border border-white/10`}
          >
            <ChevronLeft className="text-white w-6 h-6" />
          </Pressable>
        </View>

        {/* Content Overlay */}
        <View className="px-8 mt-[-120px]">
          <View className="items-center mb-8">
            <Text className="text-white text-4xl font-black text-center mb-2 uppercase italic tracking-tighter">
              {details.title || details.name}
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                <Text className="text-white font-bold">{details.vote_average?.toFixed(1)}</Text>
              </View>
              <View className="w-1 h-1 bg-gray-600 rounded-full" />
              <Text className="text-gray-400 font-medium">{(details.release_date || details.first_air_date)?.split("-")[0]}</Text>
              <View className="w-1 h-1 bg-gray-600 rounded-full" />
              <Text className="text-gray-400 font-medium">{details.runtime || details.episode_run_time?.[0] || "?"}m</Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-8">
            <Pressable 
              onPress={handlePlay}
              className="flex-1 bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/20 active:scale-95 transition-transform"
            >
              <Play className="text-white fill-white w-6 h-6 mr-2" />
              <Text className="text-white text-lg font-black">{t("watchNow")}</Text>
            </Pressable>
            <Pressable 
              onPress={handleToggleWatchlist}
              className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center border border-white/10 active:scale-95 transition-transform"
            >
              <Plus className="text-white w-6 h-6" />
            </Pressable>
            <Pressable 
              onPress={handleShare}
              className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center border border-white/10 active:scale-95 transition-transform"
            >
              <Share2 className="text-white w-5 h-5" />
            </Pressable>
          </View>

          <Text className="text-gray-400 leading-6 text-base mb-8 text-center px-4">
            {details.overview}
          </Text>

          <View className="flex-row flex-wrap justify-center gap-2 mb-10">
            {details.genres?.map((genre: any) => (
              <View key={genre.id} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                <Text className="text-white text-xs font-semibold">{genre.name}</Text>
              </View>
            ))}
          </View>

          {/* Cast */}
          <View className="mb-12">
            <Text variant="h4" className="text-white font-black uppercase tracking-widest mb-6 ml-2 italic">{t("cast")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-2">
              {details.credits?.cast?.slice(0, 12).map((person: any) => (
                <View key={person.id} className="mr-6 items-center w-24">
                  <View className="w-20 h-20 rounded-full border-2 border-primary/20 p-1 mb-3">
                    <Image
                      source={{ uri: person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : "https://via.placeholder.com/200" }}
                      className="w-full h-full rounded-full bg-muted"
                      contentFit="cover"
                    />
                  </View>
                  <Text className="text-white text-[10px] text-center font-bold uppercase" numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text className="text-gray-500 text-[8px] text-center font-medium mt-0.5" numberOfLines={1}>
                    {person.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Recommendations */}
          <MovieRow 
            title={t("moreLikeThis")} 
            data={details.recommendations?.results || []} 
            mediaType={type as string}
          />

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
