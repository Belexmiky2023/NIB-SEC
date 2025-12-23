import { Telegraf, Markup } from "telegraf";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const API_ENDPOINT = "https://nib-sec.pages.dev/api/check-phone";

// Start command
bot.start((ctx) => {
  ctx.reply(
    "🔐 NIB SEC Verification\n\nPlease enter your phone number to continue."
  );
});

// Handle phone number input
bot.on("text", async (ctx) => {
  const rawInput = ctx.message.text;
  const phone = rawInput.replace(/\D/g, "");

  // Basic validation
  if (phone.length < 8) {
    return ctx.reply(
      "❌ Invalid Phone Number",
      Markup.inlineKeyboard([
        Markup.button.url("Support Team", "https://t.me/oryn179"),
      ])
    );
  }

  // Checking message
  await ctx.reply("⏳ Checking...");

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      throw new Error("API failure");
    }

    const data = await response.json();

    // No code exists
    if (!data.valid || !data.code) {
      return ctx.reply(
        "❌ Invalid Phone Number",
        Markup.inlineKeyboard([
          Markup.button.url("Support Team", "https://t.me/oryn179"),
        ])
      );
    }

    // Send verification code
    await ctx.reply(
      `✅ Verification Code\n\n🔢 *${data.code}*`,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error(error);
    ctx.reply("⚠️ Verification service temporarily unavailable.");
  }
});

// Launch bot
bot.launch();

console.log("NIB SEC verification bot is running.");
