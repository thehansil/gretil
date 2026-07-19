import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Reminder from "../models/Reminder.js";
import { connectDB } from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("get-reminders")
    .setDescription("Retrieve your upcoming reminders"),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
      });
      await connectDB();

      const reminders = await Reminder.find({
        userId: interaction.user.id,
      })
        .sort({
          remindAt: 1,
        })
        .limit(25);

      if (reminders.length === 0) {
        await interaction.editReply("You have no upcoming reminders.");
        return;
      }

      const reminderList = (
        await Promise.all(
          reminders.map(async (reminder, index) => {
            try {
              const channel = await interaction.client.channels.fetch(
                reminder.channelId
              );

              if (!channel || !channel.isTextBased()) {
                return `${
                  index + 1
                }. ❌ Channel Unavailable | Remind At: ${reminder.remindAt.toLocaleString()}`;
              }

              const message = await channel.messages.fetch(reminder.messageId);

              return `${index + 1}. Message: ${
                message.url
              } | Remind At: ${reminder.remindAt.toLocaleString()}`;
            } catch (error) {
              console.error(
                `Error retrieving message for reminder ${reminder.id}:`,
                error
              );

              return `${
                index + 1
              }. Issue Retrieving Message | Remind At: ${reminder.remindAt.toLocaleString()}`;
            }
          })
        )
      ).join("\n");

      await interaction.editReply({
        content: `Here are your upcoming reminders:\n${reminderList}`,
      });
    } catch (error) {
      await logError(interaction.client, error, "Error retrieving reminders.");
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content:
            "There was an error retrieving your reminders. Please try again later.",
        });
      } else {
        await interaction.reply({
          content:
            "There was an error retrieving your reminders. Please try again later.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

export default command;
