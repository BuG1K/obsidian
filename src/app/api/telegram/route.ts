// pages/api/telegram.js
import TelegramBot from "node-telegram-bot-api";
import { handleStart, handleContact, hendleUserNickname } from "@/utils/bot/hendlersb";
import { users } from "@/utils/bot/store";

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_TOKEN is not set");
}

// Один экземпляр бота на холодный старт
const bot = new TelegramBot(token, { polling: false });

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Логи будут видны в Vercel → Deployments → Functions → /api/telegram
    // eslint-disable-next-line no-console
    console.log("Telegram update:", JSON.stringify(update));
    const user = users.get(update.message?.chat.id || 0) || { step: null };

    const msg = update.message || update.edited_message || null;
    if (msg) {
      // /start
      if (msg.text === "/start") {
        await handleStart(bot, msg);
        return new Response("ok", { status: 200 });
      }

      // Контакт (после нажатия кнопки "Поделиться контактом")
      if (msg.contact) {
        await handleContact(bot, msg);
        return new Response("ok", { status: 200 });
      }

      if (user.step === "await_nickname") {
        await hendleUserNickname(bot, msg);
        return new Response("ok", { status: 200 });
      }

      // Обычный текст/кнопки
      if (typeof msg.text === "string") {
        // await handleText(bot, msg);
        return new Response("ok", { status: 200 });
      }
    }

    // Если это не message (например, callback_query и т.п.) — просто ок
    return new Response("ok", { status: 200 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Webhook error:", e);
    return new Response("ok", { status: 200 }); // Telegram ждёт 200, даже при логических ошибках
  }
}

export async function GET() {
  return Response.json({ status: "Bot is running" });
}
