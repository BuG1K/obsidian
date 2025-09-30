import TelegramBot from "node-telegram-bot-api";
import connectDB from "@/database/db";
import User from "@/database/User";
import { setUser } from "./store";

const handleStart = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;

  setUser(chatId, { step: "await_contact" });

  await bot.sendMessage(chatId, "Добро пожаловать! 🚀\n\nДля авторизации поделитесь своим контактом.", {
    reply_markup: {
      keyboard: [
        [{ text: "📱 Поделиться контактом", request_contact: true }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const handleContact = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const phone = msg.contact?.phone_number || null;
  const name = msg.from?.first_name || "Пользователь";

  if (!phone) {
    await handleStart(bot, msg);
    return 200;
  }

  await connectDB();
  let user = await User.findOne({ chatId });

  if (user) {
    await bot.sendMessage(chatId, "Вы успешно авторизованы! 🎮");
    setUser(chatId, { step: null });
    return 200;
  }

  if (!user) {
    user = await User.create({
      name,
      phone,
      chatId,
      telegram: msg.from?.username,
    });
  }

  await bot.sendMessage(
    chatId,
    "Пожалуйста, введите ваш никнейм (имя, которое будет видно другим):",
  );

  setUser(chatId, { step: "await_nickname" });

  return 200;
};

const hendleUserNickname = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  console.log("Received nickname:", text);
  if (!text) {
    await bot.sendMessage(chatId, "Пожалуйста, введите корректный никнейм:");
    return 500;
  }

  await connectDB();
  const user = await User.findOne({ chatId });
  console.log("Fetched user from DB:", user);
  if (!user) {
    await bot.sendMessage(chatId, "Ошибка: пользователь не найден. Пожалуйста, начните заново с /start.");
    setUser(chatId, { step: null });
    return 500;
  }

  if (user.step === "await_nickname") {
    // Сохраняем никнейм в базе
    console.log("Setting username:", text);
    await User.updateOne({ chatId }, { username: text });
    await bot.sendMessage(chatId, "Вы успешно зарегистрированы! 🎮");
    setUser(chatId, { step: null });

    return 200;
  }

  await bot.sendMessage(chatId, "Никнейм можно установить только один раз. Если вы хотите его изменить, обратитесь в поддержку.");
  return 400;
};

export { handleStart, handleContact, hendleUserNickname };
