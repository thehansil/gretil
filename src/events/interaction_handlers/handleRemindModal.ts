import * as chrono from "chrono-node";
import Reminder from "../../models/Reminder.js";

export default async function handleRemindModal(interaction) {
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
      ephemeral: true,
    });
    return;
  }

  if (time < new Date()) {
    await interaction.reply({
      content: `❌ The time you provided is in the past. Please provide a future time for the reminder.`,
      ephemeral: true,
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
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: `There was an error setting up your reminder. Please try again later. \n ${error}`,
      ephemeral: true,
    });
  }
}
