import { Interaction, MessageFlags } from "discord.js";
import * as chrono from "chrono-node";
import Reminder from "../../models/Reminder.js";
import logError from "../../helpers/logError.js";

export default async function handleRemindModalSubmit(
  interaction: Interaction
) {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId.startsWith("remindModal-")) {
    const messageId = interaction.customId.split("-")[1];
    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    const timeInput = interaction.fields.getTextInputValue("remindTime");

    const time = chrono.parseDate(timeInput, new Date(), {
      forwardDate: true,
    });

    if (!time) {
      await interaction.reply({
        content: `❌ I couldn't understand the time you provided. Please try again with a different format.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (time < new Date()) {
      await interaction.reply({
        content: `❌ The time you provided is in the past. Please provide a future time for the reminder.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await Reminder.create({
        userId: userId,
        messageId: messageId,
        channelId: channelId,
        remindAt: time,
      });
      await interaction.reply({
        content: `✅ Got it! I'll DM you the reminder.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: `There was an error setting up your reminder. Please try again later. \n ${error}`,
        flags: MessageFlags.Ephemeral,
      });
      await logError(interaction.client, error, "Error creating reminder.");
    }
  }
}
