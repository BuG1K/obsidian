// pages/api/telegramWebhook.ts
import connectDB from "@/database/db";
import TaxiUser from "@/database/TaxiUser";
import { NextRequest } from "next/server";
import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN_TAXI || "";
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

const GET = async (request: NextRequest) => {
  const phone = request.nextUrl.searchParams.get("phone") as string;

  if (!phone) {
    return new Response(JSON.stringify({
      error: "Phone is required",
    }), { status: 404 });
  }

  await connectDB();
  const user = await TaxiUser.findOne({ phone });

  if (!user) {
    return new Response(JSON.stringify({
      error: "User not found",
    }), { status: 404 });
  }

  const status = await bot.sendMessage(
    user.telegramChatId,
    "Спасибо за поездку! 🎉",
  );

  if (!status) {
    return new Response(JSON.stringify({
      error: "Failed to send message",
    }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

const POST = async (request: NextRequest) => {
  try {
    const update = await request.json();

    // eslint-disable-next-line no-console
    console.log("Telegram update:", JSON.stringify(update));

    const msg = update.message || update.edited_message || null;
    const chatId = msg?.chat?.id;

    if (msg) {
      // /start
      if (msg.text === "/start") {
        await bot.sendMessage(
          chatId,
          "Добро пожаловать! Давай зарегистрируемся.\n\nВведите ваш никнейм:",
        );

        return new Response("ok", { status: 200 });
      }

      // Контакт (после нажатия кнопки "Поделиться контактом")
      if (msg.contact) {
        const phone = msg.contact?.phone_number || null;
        const name = msg.from?.first_name || "Пользователь";

        if (!phone) {
          await bot.sendMessage(
            chatId,
            "Для регистрации нажмите /start или поделитесь контактом ещё раз.",
          );

          return new Response("ok", { status: 200 });
        }

        await connectDB();
        const user = await TaxiUser.create({
          name,
          phone,
          chatId,
        });

        if (!user) {
          await bot.sendMessage(chatId, "Ошибка регистрации. Попробуйте позже.");

          return new Response("ok", { status: 200 });
        }

        await bot.sendMessage(chatId, `Привет, ${name}! Вы успешно зарегистрированы и участвуете в акции 🎉`);

        return new Response("ok", { status: 200 });
      }

      // Обычный текст/кнопки
      if (typeof msg.text === "string") {
        await bot.sendMessage(
          chatId,
          "Просто заказывайте такси и вы молодец ",
        );
      }
    }

    // Если это не message (например, callback_query и т.п.) — просто ок
    return new Response("ok", { status: 200 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Webhook error:", e);
    return new Response("ok", { status: 200 }); // Telegram ждёт 200, даже при логических ошибках
  }
};

export { GET, POST };
