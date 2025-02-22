import { Events, Message } from "discord.js";

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
      try {
        const twitterRegex =
          /https?:\/\/(www\.)?(twitter\.com|x\.com)([^?\s]+)(\?[^\s]*)?/gi;
        const matches = message.content.match(twitterRegex);
        if (matches) {
          const newLinks = matches.map((link) =>
            link.replace(twitterRegex, "https://xcancel.com$3")
          );
          await message.suppressEmbeds(true);
          await message.channel.send(
            "Twitterless link:\n" + newLinks.join("\n")
          );
        }
      } catch (error) {
        console.error("Failed to provide link", error);
      }
    }
  },
};

export default event;
