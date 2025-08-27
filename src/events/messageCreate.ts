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

    if (message.content?.toLowerCase().includes("onion")) {
      const user = await message.guild.members
        .fetch(process.env.ONION_HATER_ID)
        .catch(() => null);
      if (!user) return;
      await message.react("🧅");
      const randomNumber = Math.floor(Math.random() * 3) + 1;
      let response: string;
      switch (randomNumber) {
        case 1:
          response = `🚨🚨 Onion alert level RED! Paging ${user}`;
          break;
        case 2:
          response = `🧅Onions🧅 have entered the chat. ${user}`;
          break;
        case 3:
          response = `👀 Did someone just say… onions? ${user} is NOT going to like this.`;
          break;
      }
      await message.channel.send(response);
    }
  },
};

export default event;
