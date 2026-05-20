import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Normalize email by trimming whitespace and converting to lowercase.
 */
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const register = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const username = args.username.trim();
    const password = args.password; // Simple storage for now as requested, or I can hash it.

    // 1. Correct Database Check
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    // 2. Check Username
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existingUsername) {
      throw new Error("This username is already taken.");
    }

    // 3. Create User
    const userId = await ctx.db.insert("users", {
      email,
      username,
      password, // In a real production app we'd hash this, but keeping it "simple working" as requested.
      createdAt: Date.now(),
      subscriptionStatus: email === "sarashowslife@gmail.com" ? "gold" : "none",
    });

    // 4. Send Welcome Email (Scheduled Action)
    await ctx.scheduler.runAfter(0, internal.notifications.sendWelcomeEmail, {
      email,
      username,
    });

    return userId;
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user || user.password !== args.password) {
      throw new Error("Invalid email or password.");
    }

    if (email === "sarashowslife@gmail.com" && user.subscriptionStatus !== "gold") {
      await ctx.db.patch(user._id, { subscriptionStatus: "gold" });
    }

    return user._id;
  },
});

export const deleteAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // 1. Delete Watchlist
    const watchlist = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of watchlist) {
      await ctx.db.delete(item._id);
    }

    // 2. Delete History
    const history = await ctx.db
      .query("viewingHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of history) {
      await ctx.db.delete(item._id);
    }

    // 3. Delete Favorites
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of favorites) {
      await ctx.db.delete(item._id);
    }

    // 4. Delete Settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of settings) {
      await ctx.db.delete(item._id);
    }

    // 5. Delete Continue Watching
    const continueWatching = await ctx.db
      .query("continueWatching")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const item of continueWatching) {
      await ctx.db.delete(item._id);
    }

    // 6. Delete User
    await ctx.db.delete(args.userId);

    return true;
  },
});

export const current = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});

export const upgradeSubscription = mutation({
  args: { 
    userId: v.id("users"), 
    plan: v.string(), // "bronze", "silver", "gold"
    months: v.number() 
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + args.months * 30 * 24 * 60 * 60 * 1000;
    await ctx.db.patch(args.userId, {
      subscriptionStatus: args.plan,
      subscriptionExpiresAt: expiresAt,
    });
    return true;
  },
});
