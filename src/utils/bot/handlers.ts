// bot/handlers.js
import TelegramBot from "node-telegram-bot-api";
import User from "@/database/User";
import connectDB from "@/database/db";
import { mainMenu, shareContactKeyboard, homeOnly } from "./keyboards";
import { getUser, setUser } from "./store";

const CONTACTS_STATIC = {
  phone: "+7 (914) 935-84-04",
  vk: "-",
  address: "ул. Колхозная пл, 40, Черемхово",
};

// function escapeMarkdownV2(text: string) {
//   return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\-])/g, "\\$1");
// }

async function sendHome(bot: TelegramBot, chatId: number) {
  await bot.sendMessage(
    chatId,
    "🏠 Главное меню",
    { reply_markup: mainMenu },
  );
}

async function sendProfile(bot: TelegramBot, chatId: number) {
  await connectDB();
  const user = await User.findOne({ chatId });

  if (!user) {
    await bot.sendMessage(
      chatId,
      "Профиль не найден. Пожалуйста, зарегистрируйтесь заново командой /start.",
      { reply_markup: mainMenu },
    );
    return;
  }

  const nickname = user.name || "Не указано";
  const bonus = user.bonus || 0;

  await bot.sendMessage(
    chatId,
    `👤 Профиль\n\nНикнейм: ${nickname}\nБонусы: ${bonus}`,
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

function normalizePhoneForTel(phone: string) {
  // Оставляем только цифры и плюс — это безопасно для tel: ссылки
  return phone.replace(/[^+\d]/g, "");
}

async function sendContacts(bot: TelegramBot, chatId: number) {
  const phoneRaw = CONTACTS_STATIC.phone; // например "+7 (999) 123-45-67"
  const phoneForTel = normalizePhoneForTel(phoneRaw); // "+79991234567"
  const telUrl = `tel:${phoneForTel}`;

  const vkUrl = CONTACTS_STATIC.vk; // например "https://vk.com/yourgroup"
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACTS_STATIC.address)}`;

  const text = `📞 Контакты\n\n📱 ${phoneRaw}\n🌐 ${vkUrl}\n📍 ${CONTACTS_STATIC.address}`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📱 Позвонить", url: telUrl }],
      [{ text: "🌐 Открыть группу ВК", url: vkUrl }],
      [{ text: "📍 Открыть в картах", url: mapsUrl }],
    ],
  };

  await bot.sendMessage(chatId, text, { reply_markup: keyboard });
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
  const name = msg.from?.first_name || "Пользователь";

  if (!phone) {
    await bot.sendMessage(chatId, "Контакт не распознан. Попробуйте ещё раз.", {
      reply_markup: shareContactKeyboard,
    });
    return;
  }

  await connectDB();
  const user = await User.create({
    name,
    phone,
    chatId,
  });

  // eslint-disable-next-line no-console
  console.log("New user registered:", user);

  if (!user) {
    await bot.sendMessage(chatId, "Ошибка регистрации. Попробуйте позже.");
    return;
  }

  await bot.sendMessage(
    chatId,
    "Регистрация завершена! ✅",
    { reply_markup: mainMenu },
  );
  await sendProfile(bot, chatId);
}
