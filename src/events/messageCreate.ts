import { Events, Message } from "discord.js";
import handleOnionMessage from "./message-handlers/handleOnionMessage.js";
import handleTwitterLink from "./message-handlers/handleTwitterLink.js";

const event = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    if (message.author.bot) return;

    if (message.content?.toLowerCase() === "hello") {
      await message.reply("Hi!");
    }

    if (
      message.content?.includes("https://x.com") ||
      message.content?.includes("https://twitter.com")
    ) {
      await handleTwitterLink(message);
    }

    if (message.content?.toLowerCase().includes("onion")) {
      await handleOnionMessage(message);
    }
  },
};

export default event;
