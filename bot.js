import { Telegraf, Markup } from "telegraf";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Signal checking endpoint
const API_ENDPOINT = "https://nib-sec.pages.dev/api/check-phone";

bot.start((ctx) => {
  ctx.reply(
    "🔐 *NIB SEC Neural Handshake*\n\nPlease enter your phone number to receive your secure verification signal.\n\n💡 *Tip:* You can enter it in full (e.g., `+2519...`) or starting with 0 (e.g., `09...`).",
    { parse_mode: "Markdown" }
  );
});

bot.on("text", async (ctx) => {
  let rawInput = ctx.message.text.trim();
  
  // Normalization logic: Prepend +251 if user types 09...
  let phone = rawInput;
  if (phone.startsWith("0")) {
    phone = "+251" + phone.substring(1);
  } else if (!phone.startsWith("+")) {
    // Basic catch-all: if no +, add it (handles inputs like 2519...)
    phone = "+" + phone.replace(/\D/g, "");
  }

  // Length check (normalized)
  if (phone.length < 10) {
    return ctx.reply(
      "❌ *Signal Rejected: Invalid Phone Node*\n\nPlease provide a valid phone number. Use international format if possible (e.g. +251...).",
      { parse_mode: "Markdown" }
    );
  }

  const statusMsg = await ctx.reply("⏳ *Scanning D1 Neural Registry...*", { parse_mode: "Markdown" });

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
        "❌ *No Active Signal Found*\n\nPlease request a code in the NIB SEC app first using this phone node (" + phone + ").",
        { 
          parse_mode: "Markdown",
          ...Markup.inlineKeyboard([
            Markup.button.url("Support Channel", "https://t.me/nibsec"),
          ])
        }
      );
    }

    await ctx.editMessageText(
      `✅ *Verification Signal Received*\n\n🔢 *${data.code}*\n\nEnter this into your terminal now for node ${phone}.`,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    ctx.editMessageText("⚠️ *Neural Link Interrupted*\nVerification service is temporarily unavailable. Please try again later.", { parse_mode: "Markdown" });
  }
});

bot.launch();
console.log("NIB SEC bot active.");