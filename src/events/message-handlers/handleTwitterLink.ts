import { Message, MessageFlags } from "discord.js";
import logError from "../../helpers/logError.js";

export default async function handleTwitterLink(message: Message) {
  try {
    if (!message.channel.isSendable()) return;
    const twitterRegex =
      /https?:\/\/(www\.)?(twitter\.com|x\.com)([^?\s]+)(\?[^\s]*)?/gi;
    const matches = message.content.match(twitterRegex);
    if (matches) {
      const newLinks = matches.map((link) =>
        link.replace(twitterRegex, "https://xcancel.com$3")
      );
      await message.channel.send({
        content: "Twitterless link:\n" + newLinks.join("\n"),
        flags: MessageFlags.SuppressEmbeds,
      });
    }
  } catch (error) {
    await logError(message.client, error, "Failed to provide link.");
  }
}
