import { KeyboardButton, ReplyKeyboardMarkup } from "node-telegram-bot-api";

const mainMenu: ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "👤 Профиль" }, { text: "📞 Контакты" }, { text: "💵 Цены" }],
    [{ text: "💬 Обратная связь" }],
  ] as KeyboardButton[][],
  resize_keyboard: true,
};

export { mainMenu };
