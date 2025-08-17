import connectDB from "@/database/db";
import TaxiOrder from "@/database/TaxiOrder";
import TaxiUser from "@/database/TaxiUser";
import generateShortCode from "@/utils/generateShortCode";
import { NextRequest } from "next/server";
import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN_TAXI || "";
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

const GET = async (request: NextRequest) => {
  const phone = request.nextUrl.searchParams.get("phone") as string;
  const orderId = request.nextUrl.searchParams.get("order_id") as string;

  if (!phone) {
    return new Response(JSON.stringify({
      error: "Phone is required",
    }), { status: 404 });
  }

  await connectDB();
  const validPhone = `7${phone.slice(1)}`;

  const user = await TaxiUser.findOne({ phone: validPhone });

  if (!user) {
    return new Response(JSON.stringify({
      error: "User not found",
    }), { status: 404 });
  }

  const code = generateShortCode();
  // eslint-disable-next-line no-underscore-dangle
  const order = await TaxiOrder.create({ userId: user._id, orderId, code });

  if (!order) {
    return new Response(JSON.stringify({
      error: "Failed to create order",
    }), { status: 500 });
  }

  const status = await bot.sendMessage(
    user.chatId,
    `Спасибо за поездку! 🎉 Ваш уникальный код для розыгрыша:${code}`,
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
    const msg = update.message || update.edited_message || null;
    const chatId = msg?.chat?.id;

    if (msg) {
      if (msg.text === "/start") {
        await bot.sendMessage(chatId, "Нажмите кнопку ниже, чтобы участвовать в акции 🚖", {
          reply_markup: {
            keyboard: [[{ text: "📲 Поделиться контактом", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });

        return new Response("ok", { status: 200 });
      }

      if (msg.contact) {
        const phone = msg.contact.phone_number;
        const name = msg.from?.first_name || "Пользователь";

        await connectDB();

        let user = await TaxiUser.findOne({ phone });
        if (!user) {
          user = await TaxiUser.create({ name, phone, chatId });
          if (!user) {
            await bot.sendMessage(chatId, "Ошибка регистрации. Попробуйте позже.");
            return new Response("ok", { status: 500 });
          }
        }

        // Сначала убираем клавиатуру с контактом
        await bot.sendMessage(chatId, "Регистрация завершена ✅", {
          reply_markup: {
            remove_keyboard: true,
          },
        });

        // Небольшая пауза, чтобы Telegram успел убрать клавиатуру
        await new Promise<void>((resolve) => { setTimeout(resolve, 300); });

        // Потом отправляем сообщение с inline-кнопками
        await bot.sendMessage(
          chatId,
          `Привет, ${name}! Вы успешно зарегистрированы и участвуете в акции 🎉\n\n`
      + "🌐 Наш сайт: https://taxi-novoe.ru/\n"
      + "📞 Основной номер: 65-67-11\n"
      + "📱 Мегафон: 8 (3952) 65-67-11",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🌐 Перейти на сайт", url: "https://taxi-novoe.ru/" },
                  { text: "📞 Позвонить", url: "tel:+73952657111" },
                ],
              ],
            },
          },
        );

        return new Response("ok", { status: 200 });
      }

      if (typeof msg.text === "string") {
        await bot.sendMessage(
          chatId,
          "Спасибо за сообщение! 🚖 Напоминаем: за каждую поездку мы дарим код для розыгрыша!",
        );
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Webhook error:", e);
    return new Response("ok", { status: 200 });
  }
};

export { GET, POST };
