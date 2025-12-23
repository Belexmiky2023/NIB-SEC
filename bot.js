import { Telegraf, Markup } from "telegraf";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Signal checking endpoint
const API_ENDPOINT = "https://nib-sec.pages.dev/api/check-phone";

bot.start((ctx) => {
  ctx.reply(
    "🔐 *NIB SEC Neural Handshake*\n\nPlease enter your phone number to receive your secure verification signal.\n\n💡 *Tip:* You can enter it in full (e.g., `2519...`) or just starting with 0 (e.g., `09...`).",
    { parse_mode: "Markdown" }
  );
});

bot.on("text", async (ctx) => {
  let rawInput = ctx.message.text.trim();
  
  // Normalize phone number logic
  // Requirement 2: Add +251 if user types 09...
  let phone = rawInput.replace(/\D/g, "");
  if (phone.startsWith("0")) {
    phone = "251" + phone.substring(1);
  }

  if (phone.length < 9) {
    return ctx.reply(
      "❌ *Signal Rejected: Invalid Phone Node*\n\nPlease provide a valid phone number with or without the country code.",
      { parse_mode: "Markdown" }
    );
  }

  const statusMsg = await ctx.reply("⏳ *Scanning KV Registry...*", { parse_mode: "Markdown" });

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) throw new Error("API Offline");

    const data = await response.json();

    if (!data.valid || !data.code) {
      return ctx.editMessageText(
        "❌ *No Active Signal Found*\n\nPlease request a code in the NIB SEC app first using this phone node.",
        { 
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            Markup.button.url("Support Channel", "https://t.me/nibsec"),
          ])
        }
      );
    }

    await ctx.editMessageText(
      `✅ *Verification Signal Received*\n\n🔢 *${data.code}*\n\nEnter this into your terminal now.`,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    ctx.editMessageText("⚠️ *Neural Link Interrupted*\nVerification service is temporarily unavailable. Please try again later.", { parse_mode: "Markdown" });
  }
});

bot.launch();
console.log("NIB SEC bot active.");
