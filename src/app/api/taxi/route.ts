import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_TOKEN environment variable is not set");
}
const bot = new TelegramBot(token, { polling: false }); // polling выключен

export async function POST(request: Request) {
  const body = await request.json();
  const { message } = body;

  if (message?.text) {
    const chatId = message.chat.id;
    await bot.sendMessage(chatId, `Ты написал: ${message.text}`);
  }

  return new Response("ok", { status: 200 });
}

export async function GET() {
  return Response.json({ status: "Bot is running" });
}
