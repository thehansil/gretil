import {
  ChatInputCommandInteraction,
  GuildTextBasedChannel,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Reminder from "../models/Reminder.js";
import { connectDB } from "../helpers/dbInitialize.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("get-reminders")
    .setDescription("Retrieve your upcoming reminders"),

  async execute(interaction: ChatInputCommandInteraction) {
    await connectDB();
    const userId = interaction.user.id;
    try {
      const reminders = await Reminder.find({ userId }).sort({ remindAt: 1 });

      if (reminders.length === 0) {
        await interaction.reply({
          content: "You have no upcoming reminders.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const client = interaction.client;
      const channel = (await client.channels.fetch(
        reminders[0].channelId
      )) as GuildTextBasedChannel;

      if (!channel) {
        return "⚠️ Channel no longer exists";
      }

      const reminderList = (
        await Promise.all(
          reminders.map(async (reminder, index) => {
            try {
              const message = await channel.messages.fetch(reminder.messageId);
              return `${index + 1}. Message: ${
                message.url
              } | Remind At: ${reminder.remindAt.toLocaleString()}`;
            } catch (error) {
              // Message was deleted or inaccessible
              console.error(error);
              return `${
                index + 1
              }. Message: ❌ Deleted | Remind At: ${reminder.remindAt.toLocaleString()}`;
            }
          })
        )
      ).join("\n");

      await interaction.reply({
        content: `Here are your upcoming reminders:\n${reminderList}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error retrieving reminders:", error);
      await interaction.reply({
        content:
          "There was an error retrieving your reminders. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
