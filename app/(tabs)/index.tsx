import React from "react";
import { SafeAreaView, ScrollView, View, Spinner, Text } from "@/components/ui";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HeroBanner } from "@/components/hero-banner";
import { MovieRow } from "@/components/movie-row";
import { useLanguage } from "@/hooks/use-language";
import { Logo } from "@/components/logo";

export default function HomeScreen() {
  const { t, isRTL } = useLanguage();
  const getTrending = useAction(api.tmdb.getTrending);
  const getPopular = useAction(api.tmdb.getPopular);
  const getTopRated = useAction(api.tmdb.getTopRated);
  const getDiscover = useAction(api.tmdb.getDiscover);

  const [trending, setTrending] = React.useState<any[]>([]);
  const [popularMovies, setPopularMovies] = React.useState<any[]>([]);
  const [popularTV, setPopularTV] = React.useState<any[]>([]);
  const [topRated, setTopRated] = React.useState<any[]>([]);
  const [anime, setAnime] = React.useState<any[]>([]);
  const [horror, setHorror] = React.useState<any[]>([]);
  const [action, setAction] = React.useState<any[]>([]);
  const [scifi, setScifi] = React.useState<any[]>([]);
  const [drama, setDrama] = React.useState<any[]>([]);
  const [newReleases, setNewReleases] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [
          trendingData, 
          popMoviesData, 
          popTVData, 
          topRatedData, 
          animeData, 
          horrorData,
          actionData,
          scifiData,
          dramaData,
          newReleasesData
        ]: any[] = await Promise.all([
          getTrending({ mediaType: "all", timeWindow: "day" }),
          getPopular({ mediaType: "movie" }),
          getPopular({ mediaType: "tv" }),
          getTopRated({ mediaType: "movie" }),
          getDiscover({ mediaType: "tv", genreId: 16 }), // Anime
          getDiscover({ mediaType: "movie", genreId: 27 }), // Horror
          getDiscover({ mediaType: "movie", genreId: 28 }), // Action
          getDiscover({ mediaType: "movie", genreId: 878 }), // Sci-Fi
          getDiscover({ mediaType: "movie", genreId: 18 }), // Drama
          getTrending({ mediaType: "movie", timeWindow: "week" }), // New Releases approx
        ]);

        setTrending((trendingData as any).results || []);
        setPopularMovies((popMoviesData as any).results || []);
        setPopularTV((popTVData as any).results || []);
        setTopRated((topRatedData as any).results || []);
        setAnime((animeData as any).results || []);
        setHorror((horrorData as any).results || []);
        setAction((actionData as any).results || []);
        setScifi((scifiData as any).results || []);
        setDrama((dramaData as any).results || []);
        setNewReleases((newReleasesData as any).results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Logo size="lg" className="mb-4" />
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      <ScrollView className="flex-1">
        <View className="px-6 py-4 absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between">
          <Logo size="md" />
        </View>
        <HeroBanner movie={trending[0]} />
        <View className="mt-[-60px]">
          <MovieRow 
            title="Trending Now" 
            data={trending} 
            categoryParams={{ type: "trending", mediaType: "all", timeWindow: "day" }}
          />
          <MovieRow 
            title="New Releases" 
            data={newReleases} 
            mediaType="movie" 
            categoryParams={{ type: "trending", mediaType: "movie", timeWindow: "week" }}
          />
          <MovieRow 
            title="Popular Movies" 
            data={popularMovies} 
            mediaType="movie" 
            categoryParams={{ type: "popular", mediaType: "movie" }}
          />
          <MovieRow 
            title="TV Shows" 
            data={popularTV} 
            mediaType="tv" 
            categoryParams={{ type: "popular", mediaType: "tv" }}
          />
          <MovieRow 
            title="Anime" 
            data={anime} 
            mediaType="tv" 
            categoryParams={{ type: "discover", mediaType: "tv", genreId: 16 }}
          />
          <MovieRow 
            title="Action Blockbusters" 
            data={action} 
            mediaType="movie" 
            categoryParams={{ type: "discover", mediaType: "movie", genreId: 28 }}
          />
          <MovieRow 
            title="Horror Essentials" 
            data={horror} 
            mediaType="movie" 
            categoryParams={{ type: "discover", mediaType: "movie", genreId: 27 }}
          />
          <MovieRow 
            title="Sci-Fi & Fantasy" 
            data={scifi} 
            mediaType="movie" 
            categoryParams={{ type: "discover", mediaType: "movie", genreId: 878 }}
          />
          <MovieRow 
            title="Dramatic Masterpieces" 
            data={drama} 
            mediaType="movie" 
            categoryParams={{ type: "discover", mediaType: "movie", genreId: 18 }}
          />
          <MovieRow 
            title="Top Rated" 
            data={topRated} 
            mediaType="movie" 
            categoryParams={{ type: "top_rated", mediaType: "movie" }}
          />
          
          <View className="items-center py-20 opacity-40 border-t border-white/5 mt-10">
            <Logo size="md" className="mb-4" />
            <Text className="text-gray-500 text-[10px] font-black tracking-[4px] uppercase italic">
              Premium Cineverse+ Experience
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
