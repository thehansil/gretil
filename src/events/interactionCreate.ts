import { Events, Interaction, MessageFlags } from "discord.js";
import * as chrono from "chrono-node";
import Reminder from "../models/Reminder.js";
import { connectDB } from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";

const event = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isMessageContextMenuCommand() &&
      !interaction.isModalSubmit()
    )
      return;

    await connectDB();

    if (interaction.isModalSubmit()) {
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
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      await logError(
        interaction.client,
        new Error(`No command matching ${interaction.commandName} was found.`),
        "Command not found."
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      await logError(interaction.client, error, "Error executing command.");
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

export default event;
