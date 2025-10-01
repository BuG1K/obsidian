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
      Телефон: +7 (914) 935-84-04
      Telegram: https://t.me/sxgclub
      VK: https://vk.com/sxgameclub

      Режим работы:
        10:00 – 23:00
        23:00 – 06:00 (по брони, 18+)
      Адрес: пл. Колхозная, 40 (Центральный рынок)
    `;

    await bot.sendMessage(
      chatId,
      contactInfo,
      {
        reply_markup: mainMenu,
        parse_mode: "HTML",
      },
    );

    await bot.sendLocation(chatId, 53.15457514877932, 103.06222622653196, {
      reply_markup: {
        inline_keyboard: [[
          { text: "Открыть в Google Maps", url: "https://www.google.com/maps/place/SX+Game+Club+(%D0%9A%D0%BE%D0%BC%D0%BF%D1%8C%D1%8E%D1%82%D0%B5%D1%80%D0%BD%D1%8B%D0%B9+%D0%BA%D0%BB%D1%83%D0%B1)/@53.154535,103.0592151,17z/data=!4m12!1m5!3m4!2zNTPCsDA5JzE2LjMiTiAxMDPCsDAzJzQyLjQiRQ!8m2!3d53.154535!4d103.06179!3m5!1s0x5d06c72f33bd725d:0xbb899ba882d848d7!8m2!3d53.15441!4d103.0624827!16s%2Fg%2F11vscxnxjc?entry=ttu&g_ep=EgoyMDI1MDkyOC4wIKXMDSoASAFQAw%3D%3D" },
        ]],
      },
    });

    return 200;
  }

  if (text === "💵 Цены") {
    await bot.sendPhoto(
      chatId,
      "https://t.me/sxgclub/7",
      { reply_markup: mainMenu },
    );

    return 200;
  }

  await bot.sendMessage(chatId, "Неизвестная команда. Пожалуйста, используйте меню ниже.", { reply_markup: mainMenu });

  return 400;
};

export {
  handleStart, handleContact, hendleUserNickname, handleText,
};
