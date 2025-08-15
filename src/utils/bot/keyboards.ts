// bot/keyboards.js

import { KeyboardButton, ReplyKeyboardMarkup } from "node-telegram-bot-api";

export const mainMenu: ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "👤 Профиль" }, { text: "📞 Контакты" }],
    [{ text: "💬 Отзывы" }, { text: "🎁 Акции" }],
    [{ text: "🏠 Главная" }],
  ] as KeyboardButton[][],
  resize_keyboard: true,
};

export const shareContactKeyboard = {
  keyboard: [[{ text: "📱 Поделиться контактом", request_contact: true }]],
  one_time_keyboard: true,
  resize_keyboard: true,
};

export const homeOnly: ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "🏠 Главная" }],
  ] as KeyboardButton[][],
  resize_keyboard: true,
};
