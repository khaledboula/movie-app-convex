import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    username: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    createdAt: v.number(),
    subscriptionStatus: v.optional(v.string()), // "none", "bronze", "silver", "gold"
    subscriptionExpiresAt: v.optional(v.number()),
  }).index("by_email", ["email"])
    .index("by_username", ["username"]),
  
  favorites: defineTable({
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.string(),
    rating: v.number(),
  }).index("by_user", ["userId"]),

  watchlist: defineTable({
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.string(),
    rating: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_media", ["userId", "mediaId"]),

  viewingHistory: defineTable({
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.string(),
    watchedAt: v.number(),
  }).index("by_user", ["userId"]),

  continueWatching: defineTable({
    userId: v.id("users"),
    mediaId: v.number(),
    mediaType: v.string(),
    title: v.string(),
    posterPath: v.string(),
    progress: v.number(), // Percentage or seconds
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  userSettings: defineTable({
    userId: v.id("users"),
    language: v.string(), // "en", "fr", "ar"
    notifications: v.boolean(),
  }).index("by_user", ["userId"]),
});
