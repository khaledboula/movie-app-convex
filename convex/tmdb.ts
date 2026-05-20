import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const TMDB_API_KEY = "18ba9f8845dbbaade58506f53caa755f";
const BASE_URL = "https://api.themoviedb.org/3";

// TMDb Actions
export const getTrending = action({
  args: { mediaType: v.string(), timeWindow: v.string() },
  handler: async (ctx, args) => {
    console.log(`Fetching trending ${args.mediaType} for ${args.timeWindow}`);
    const response = await fetch(
      `${BASE_URL}/trending/${args.mediaType}/${args.timeWindow}?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    console.log(`Fetched ${data.results?.length || 0} trending items`);
    return data;
  },
});

export const getPopular = action({
  args: { mediaType: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(
      `${BASE_URL}/${args.mediaType}/popular?api_key=${TMDB_API_KEY}`
    );
    return await response.json();
  },
});

export const getTopRated = action({
  args: { mediaType: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(
      `${BASE_URL}/${args.mediaType}/top_rated?api_key=${TMDB_API_KEY}`
    );
    return await response.json();
  },
});

export const getDiscover = action({
  args: { mediaType: v.string(), genreId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let url = `${BASE_URL}/discover/${args.mediaType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc`;
    if (args.genreId) {
      url += `&with_genres=${args.genreId}`;
    }
    const response = await fetch(url);
    return await response.json();
  },
});

export const searchMedia = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        args.query
      )}`
    );
    return await response.json();
  },
});

export const getDetails = action({
  args: { mediaType: v.string(), id: v.number() },
  handler: async (ctx, args) => {
    const response = await fetch(
      `${BASE_URL}/${args.mediaType}/${args.id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,recommendations,external_ids`
    );
    return await response.json();
  },
});

// User Content Mutations & Queries
export const toggleWatchlist = mutation({
  args: {
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, ...content } = args;

    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_media", (q) => q.eq("userId", userId).eq("mediaId", args.mediaId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { status: "removed" };
    } else {
      await ctx.db.insert("watchlist", {
        userId,
        ...content,
      });
      return { status: "added" };
    }
  },
});

export const getWatchlist = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const userId = args.userId;
    return await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addToHistory = mutation({
  args: {
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, ...content } = args;

    await ctx.db.insert("viewingHistory", {
      userId,
      ...content,
      watchedAt: Date.now(),
    });
  },
});
