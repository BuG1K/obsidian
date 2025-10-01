import TelegramBot from "node-telegram-bot-api";
import connectDB from "@/database/db";
import User from "@/database/User";
import { setUser, users, UserStep } from "./store";
import { mainMenu } from "./keyboards";

const handleStart = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;

  setUser(chatId, { step: UserStep.AwaitContact });

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
    await bot.sendMessage(
      chatId,
      "Вы успешно авторизованы! 🎮",
      { reply_markup: mainMenu },
    );
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

  setUser(chatId, { step: UserStep.AwaitNickname });

  return 200;
};

const hendleUserNickname = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) {
    await bot.sendMessage(chatId, "Пожалуйста, введите корректный никнейм:");
    return 500;
  }

  await connectDB();
  const userDb = await User.findOne({ chatId });

  if (!userDb) {
    await bot.sendMessage(chatId, "Ошибка: пользователь не найден. Пожалуйста, начните заново с /start.");
    setUser(chatId, { step: null });
    return 500;
  }

  const user = users.get(chatId);

  if (user.step === "await_nickname") {
    await User.updateOne({ chatId }, { username: text });
    await bot.sendMessage(
      chatId,
      "Вы успешно зарегистрированы! 🎮",
      { reply_markup: mainMenu },
    );
    setUser(chatId, { step: null });

    return 200;
  }

  await bot.sendMessage(
    chatId,
    "Никнейм можно установить только один раз. Если вы хотите его изменить, обратитесь в поддержку.",
    { reply_markup: mainMenu },
  );

  return 400;
};

const handleText = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim() || "";

  if (text === "👤 Профиль") {
    await connectDB();
    const userDb = await User.findOne({ chatId });

    if (!userDb) {
      await bot.sendMessage(chatId, "Ошибка: пользователь не найден. Пожалуйста, начните заново с /start.");

      return 500;
    }

    const profile = `
    👤 Профиль:
      Имя: ${userDb.name}
      Никнейм: ${userDb.username || "не установлен"}
      Уровень: ${userDb.lvl}
      Баллы: ${userDb.points}
      Баланс: ${userDb.balance} руб.
    `;

    await bot.sendMessage(chatId, profile, { reply_markup: mainMenu });

    return 200;
  }

  if (text === "📞 Контакты") {
    const contactInfo = `
    📞 Контакты:
      Телефон: [8 (914) 935-84-04](tel:+79149358404)
      Telegram: 3423dfsdf
      VK: vk.com/username

      Адрес: г. Москва, ул. Примерная, д. 1


    `;

    await bot.sendMessage(
      chatId,
      contactInfo,
      {
        reply_markup: mainMenu,
        parse_mode: "MarkdownV2",
      },
    );

    return 200;
  }

  await bot.sendMessage(chatId, "Неизвестная команда. Пожалуйста, используйте меню ниже.", { reply_markup: mainMenu });

  return 400;
};

export {
  handleStart, handleContact, hendleUserNickname, handleText,
};
