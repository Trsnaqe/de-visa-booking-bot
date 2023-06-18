require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const GetBooking = require("./booking");

const token = process.env.telegram_key;
const bot = new TelegramBot(token, { polling: true });
const abdChatId = process.env.abd_telegram_chat_id;

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  var checkString = "/check";
  if (msg.text.toString().toLowerCase().indexOf(checkString) === 0) {
    bot.sendMessage(msg.chat.id, "I am checking the website. Please wait...");
    const result = await GetBooking();
    if (result == null || result.length == 0) bot.sendMessage(msg.chat.id, "No appointments available");
    else {
      bot.sendMessage(msg.chat.id, "Appointments available");
      bot.sendMessage(msg.chat.id, JSON.stringify(result));
    }
  }
});

async function availableBookingChecker() {
  console.log("checking website");
  const result = await GetBooking();
  if (result == null || result.length == 0) {
    console.log("no appointments available");

    bot.sendMessage(abdChatId, "Appointments available");
    bot.sendMessage(abdChatId, JSON.stringify(result));
    bot.sendMessage(abdChatId, "https://otv.verwalt-berlin.de/ams/TerminBuchen/wizardng?sprachauswahl=de");
  } else {
    bot.sendMessage(abdChatId, "Appointments available");
    bot.sendMessage(abdChatId, JSON.stringify(result));
    bot.sendMessage(abdChatId, "https://otv.verwalt-berlin.de/ams/TerminBuchen/wizardng?sprachauswahl=de");
  }
}

setInterval(availableBookingChecker, 1 * 60 * 1000);
