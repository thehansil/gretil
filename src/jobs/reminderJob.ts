import cron from "node-cron";
import { Client, EmbedBuilder } from "discord.js";
import Reminder from "../models/Reminder.js";
import logError from "../helpers/logError.js";
import { DiscordAPIError } from "discord.js";

export default function startReminderJob(client: Client) {
  cron.schedule("* * * * *", async () => {
    try {
      const reminders = await Reminder.find({ remindAt: { $lte: new Date() } });

      for (const reminder of reminders) {
        try {
          const user = await client.users.fetch(reminder.userId);
          const channel = await client.channels.fetch(reminder.channelId);
          if (!channel?.isTextBased()) {
            await Reminder.deleteOne({ _id: reminder._id });
            continue;
          }

          const message = await channel.messages.fetch(reminder.messageId);
          const channelName =
            message.channel.isTextBased() && "name" in message.channel
              ? message.channel.name
              : "DM";

          const embed = new EmbedBuilder()
            .setAuthor({
              name: message.author.tag,
              iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(message.content || "*[no text]*")
            .setURL(message.url)
            .setColor("Blue")
            .setFooter({ text: `From #${channelName}` })
            .setTimestamp(message.createdAt);

          await user.send({
            content: `${user.toString()} You asked to be reminded about this message:\n\nLink: ${message.url}`,
            embeds: [embed],
          });
          await Reminder.deleteOne({ _id: reminder._id });
        } catch (error) {
          if (error instanceof DiscordAPIError) {
            switch (error.code) {
              case 10003: // Unknown Channel
              case 10008: // Unknown Message
              case 10013: // Unknown User
              case 50007: // Cannot send messages to this user
                await Reminder.deleteOne({ _id: reminder._id });
                break;

              default:
                await logError(
                  client,
                  error,
                  `Error processing reminder ${reminder._id.toString()}.`
                );
            }
          } else {
            await logError(
              client,
              error,
              `Error processing reminder ${reminder._id.toString()}.`
            );
          }
        }
      }
    } catch (error) {
      await logError(client, error, "Error retrieving reminders.");
    }
  });
}
