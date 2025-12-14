import { Events, Interaction } from "discord.js";
import * as chrono from "chrono-node";
import mongoose from "mongoose";
import Reminder from "../models/Reminder.js";

const event = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isMessageContextMenuCommand() &&
      !interaction.isModalSubmit()
    )
      return;

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
          await mongoose.connect(process.env.MONGODB_URI);
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
        } finally {
          mongoose.connection.close();
        }
      }
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};

export default event;
