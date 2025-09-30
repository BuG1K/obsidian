import { KeyboardButton, ReplyKeyboardMarkup } from "node-telegram-bot-api";

const mainMenu: ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "👤 Профиль" }],
    // [{ text: "📞 Контакты" }],
    // [{ text: "💬 Отзывы" }, { text: "🎁 Акции" }],
    // [{ text: "💵 Цены" }, { text: "🏠 Главная" }],
  ] as KeyboardButton[][],
  resize_keyboard: true,
};

export { mainMenu };
