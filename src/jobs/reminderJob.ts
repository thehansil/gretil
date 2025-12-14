import cron from "node-cron";
import mongoose from "mongoose";
import { Client, EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import Reminder from "../models/Reminder.js";

export default function startReminderJob(client: Client) {
  cron.schedule("* * * * *", async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const reminders = await Reminder.find({ remindAt: { $lte: new Date() } });

      for (const reminder of reminders) {
        const user = await client.users
          .fetch(reminder.userId)
          .catch(() => null);
        if (user) {
          const channel = (await client.channels.fetch(
            reminder.channelId
          )) as GuildTextBasedChannel;
          const message = await channel?.messages.fetch(reminder.messageId);
          if (!message) {
            await Reminder.deleteOne({ _id: reminder._id });
            continue;
          }
          const embed = new EmbedBuilder()
            .setAuthor({
              name: message.author.tag,
              iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(message.content || "*[no text]*")
            .setURL(message.url)
            .setColor("Blue")
            .setFooter({ text: `From #${message.channel.name}` })
            .setTimestamp(message.createdAt);

          await user.send({
            content: `${user} You asked to be reminded about this message:\n\nLink: ${message.url}`,
            embeds: [embed],
          });
          await Reminder.deleteOne({ _id: reminder._id });
        }
      }
    } catch (error) {
      console.error("Error retreiving or sending reminder:", error);
    } finally {
      mongoose.connection.close();
    }
  });
}
