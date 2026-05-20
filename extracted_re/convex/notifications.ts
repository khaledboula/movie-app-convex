import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";

const RESEND_API_KEY = "re_a5pos9qt_HR8pAgQYaoBHhXD5uzzRAG4E";
const ADMIN_EMAIL = "sarashowslife@gmail.com";
const FROM_EMAIL = "Cineverse+ <onboarding@resend.dev>"; // Using onboarding@resend.dev as it's the safest for test keys

export const sendAuthNotification = action({
  args: {
    type: v.string(), // "registration" | "login"
    email: v.string(),
    username: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const subjectMap: Record<string, string> = {
      register: "🚀 [NEW] Cineverse+ Registration",
      login: "🔑 [LOGIN] Cineverse+ Access",
    };

    const text = `
      Cineverse+ Auth Alert
      Event: ${args.type.toUpperCase()}
      Email: ${args.email}
      ${args.username ? `Username: ${args.username}` : ""}
      Time: ${new Date().toLocaleString()}
      Status: Success (Manual Auth Rebuilt)
    `.trim();

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: subjectMap[args.type] || "Cineverse+ Auth Alert",
          text: text,
        }),
      });
    } catch (e) {
      console.error("Resend failed:", e);
    }
  },
});

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [args.email],
          subject: "Welcome to Cineverse+! 🍿",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: white; padding: 40px; border-radius: 20px;">
              <h1 style="color: #E50914; font-style: italic; font-weight: 900;">Cineverse+</h1>
              <h2>Welcome aboard, ${args.username}!</h2>
              <p>Your account has been successfully created. You're now ready to explore the best cinematic experience.</p>
              <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px; font-size: 12px; color: #666;">
                Cineverse+ Security Team
              </div>
            </div>
          `,
        }),
      });
    } catch (e) {
      console.error("Welcome email failed:", e);
    }
  },
});
