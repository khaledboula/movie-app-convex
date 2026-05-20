import { query } from "./_generated/server";
import { v } from "convex/values";

export const hello = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return "Hello from Convex!";
  },
});
