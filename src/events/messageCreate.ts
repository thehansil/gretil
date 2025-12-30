import { Events, Message } from "discord.js";
import handleTwitterLink from "./message_handlers/handleTwitterLink.js";
import handleOnion from "./message_handlers/handleOnion.js";

const event = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    if (message.author.bot) return;

    if (message.content?.toLowerCase() === "hello") {
      message.reply("Hi!");
    }

    if (
      message.content?.includes("https://x.com") ||
      message.content?.includes("https://twitter.com")
    ) {
      await handleTwitterLink(message);
    }

    if (message.content?.toLowerCase().includes("onion")) {
      await handleOnion(message);
    }
  },
};

export default event;
