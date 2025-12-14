import {
  ChatInputCommandInteraction,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from "discord.js";
import mongoose from "mongoose";
import Reminder from "../models/Reminder.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("get-reminders")
    .setDescription("Retrieve your upcoming reminders"),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const reminders = await Reminder.find({ userId }).sort({ remindAt: 1 });

      if (reminders.length === 0) {
        await interaction.reply({
          content: "You have no upcoming reminders.",
          ephemeral: true,
        });
        return;
      }

      const client = interaction.client;
      const channel = (await client.channels.fetch(
        reminders[0].channelId
      )) as GuildTextBasedChannel;

      const reminderList = (
        await Promise.all(
          reminders.map(async (reminder, index) => {
            const message = await channel.messages.fetch(reminder.messageId);
            return `${index + 1}. ${
              message.url
            } | Remind At: ${reminder.remindAt.toLocaleString()}`;
          })
        )
      ).join("\n");

      await interaction.reply({
        content: `Here are your upcoming reminders:\n${reminderList}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error retrieving reminders:", error);
      await interaction.reply({
        content:
          "There was an error retrieving your reminders. Please try again later.",
        ephemeral: true,
      });
    } finally {
      mongoose.connection.close();
    }
  },
};

export default command;
