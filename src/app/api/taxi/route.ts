import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false }); // polling выключен

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;

    if (message?.text) {
      const chatId = message.chat.id;
      await bot.sendMessage(chatId, `Ты написал: ${message.text}`);
    }

    return res.status(200).send("ok");
  }

  res.status(200).json({ status: "Bot is running" });
}
