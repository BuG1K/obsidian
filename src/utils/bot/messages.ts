import TelegramBot from "node-telegram-bot-api";
import { mainMenu } from "./keyboards";

const sendWarningMessage = async (bot: TelegramBot, chatId: number) => {
  await bot.sendMessage(
    chatId,
    "Неизвестная команда. Пожалуйста, используйте меню ниже.",
    { reply_markup: mainMenu },
  );

  return 400;
};

const sendErrorMessage = async (bot: TelegramBot, chatId: number) => {
  await bot.sendMessage(
    chatId,
    "Ошибка: пользователь не найден. Пожалуйста, начните заново с /start.",
  );

  return 500;
};

export { sendWarningMessage, sendErrorMessage };
