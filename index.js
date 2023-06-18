require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const GetBooking = require("./booking");

const token = process.env.telegram_key;
const bot = new TelegramBot(token, { polling: true });
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  var checkString = "/check";
  if (msg.text.toString().toLowerCase().indexOf(checkString) === 0) {
    bot.sendMessage(msg.chat.id, "I am checking the website. Please wait...");
    const result = await GetBooking();
    console.log(result);
    if (result == null || result.length == 0) bot.sendMessage(msg.chat.id, "No appointments available");
    else {
        bot.sendMessage(msg.chat.id, "Appointments available");
        bot.sendMessage(msg.chat.id, JSON.stringify(result));
    }
  }
});
