// bot/handlers.js
import TelegramBot from "node-telegram-bot-api";
import User from "@/database/User";
import { mainMenu, shareContactKeyboard, homeOnly } from "./keyboards";
import { getUser, setUser } from "./store";

const CONTACTS_STATIC = {
  phone: "89086660990",
  vk: "-",
  address: "-",
};

async function sendHome(bot: TelegramBot, chatId: number) {
  await bot.sendMessage(
    chatId,
    "🏠 Главное меню",
    { reply_markup: mainMenu },
  );
}

async function sendProfile(bot: TelegramBot, chatId: number) {
  const u = getUser(chatId);
  const nickname = u.nickname || "-";
  const bonus = u.bonus ?? 0;

  await bot.sendMessage(
    chatId,
    `👤 Профиль\nНикнейм: ${nickname}\nБонусы: ${bonus}`,
    { reply_markup: mainMenu },
  );
}

async function sendPrice(bot: TelegramBot, chatId: number) {
  await bot.sendMessage(
    chatId,
    "sdfsfddf",
    { reply_markup: mainMenu },
  );
}

async function sendContacts(bot: TelegramBot, chatId: number) {
  await bot.sendMessage(
    chatId,
    `📞 Контакты\nНомер телефона: ${CONTACTS_STATIC.phone}\nГруппа ВК: ${CONTACTS_STATIC.vk}\nАдрес: ${CONTACTS_STATIC.address}`,
    { reply_markup: mainMenu },
  );
}

export async function handleStart(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  setUser(chatId, { step: "await_nickname" });

  await bot.sendMessage(
    chatId,
    "Добро пожаловать! Давай зарегистрируемся.\n\nВведите ваш никнейм:",
  );
}

export async function handleText(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  const user = getUser(chatId);

  // Кнопка "Главная"
  if (text === "🏠 Главная") {
    await sendHome(bot, chatId);
    return;
  }

  // Первичная регистрация: шаги
  if (user.step === "await_nickname") {
    // Сохраняем никнейм и просим контакт
    setUser(chatId, { nickname: text, step: "await_contact" });
    await bot.sendMessage(
      chatId,
      `Отлично, ${text}! Теперь поделитесь контактом (номер телефона) кнопкой ниже:`,
      { reply_markup: shareContactKeyboard },
    );
    return;
  }

  // Меню
  if (text === "👤 Профиль") {
    await sendProfile(bot, chatId);
    return;
  }

  if (text === "📞 Контакты") {
    await sendContacts(bot, chatId);
    return;
  }

  if (text === "💵 Цены") {
    await sendPrice(bot, chatId);
    return;
  }

  if (text === "💬 Отзывы") {
    setUser(chatId, { step: "await_review" });
    await bot.sendMessage(chatId, "Оставьте отзыв:", { reply_markup: homeOnly });
    return;
  }

  if (text === "🎁 Акции") {
    setUser(chatId, { step: "await_promo" });
    await bot.sendMessage(chatId, "Введите промокод:", { reply_markup: homeOnly });

    return;
  }

  // Обработка активных шагов
  if (user.step === "await_review") {
    setUser(chatId, { lastReview: text, step: null });
    await bot.sendMessage(
      chatId,
      "Спасибо за отзыв! 🙌",
      { reply_markup: mainMenu },
    );
    return;
  }

  if (user.step === "await_promo") {
  // Пример списка валидных промокодов
    const validPromos = ["PROMO2024", "HELLO", "BONUS100"];

    if (validPromos.includes(text.toUpperCase())) {
      setUser(chatId, { lastPromo: text, step: null });
      await bot.sendMessage(
        chatId,
        "Промокод принят! 🎉",
        { reply_markup: mainMenu },
      );
    // Здесь можно начислить бонусы
    } else {
      await bot.sendMessage(
        chatId,
        "Промокод не найден или недействителен. Попробуйте ещё раз:",
        { reply_markup: homeOnly },
      );
    // step не меняем — пользователь может попробовать снова
    }
    return;
  }

  // Если неизвестная команда — покажем главное меню
  await sendHome(bot, chatId);
}

export async function handleContact(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const phone = msg.contact?.phone_number || null;

  if (!phone) {
    await bot.sendMessage(chatId, "Контакт не распознан. Попробуйте ещё раз.", {
      reply_markup: shareContactKeyboard,
    });
    return;
  }

  await User.create({
    name, phone, telegram, points: "0",
  });
  setUser(chatId, { phone, step: null });

  await bot.sendMessage(
    chatId,
    "Регистрация завершена! ✅",
    { reply_markup: mainMenu },
  );
  await sendProfile(bot, chatId);
}
