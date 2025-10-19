import {
  ActionRowBuilder,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import mongoose from "mongoose";
import Reminder from "../models/Reminder.js";

const command = {
  data: new ContextMenuCommandBuilder()
    .setName("Remind Me")
    .setType(ApplicationCommandType.Message),

  async execute(interaction: ContextMenuCommandInteraction) {
    const messageId = interaction.targetId;

    const modal = new ModalBuilder()
      .setCustomId(`remindModal-${messageId}`)
      .setTitle("Set Reminder");

    const input = new TextInputBuilder()
      .setCustomId("remindTime")
      .setLabel("When should I remind you?")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g., 10m, 2h, 2025-10-18 15:00")
      .setRequired(true);

    const row = new ActionRowBuilder<TextInputBuilder>();
    row.addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);

    // try {
    //   await mongoose.connect(process.env.MONGODB_URI);
    //   await Reminder.create({
    //     userId: interaction.user.id,
    //     messageId: interaction.targetId,
    //     channelId: interaction.channelId,
    //     //TODO: Get time input from modal
    //     remindAt: new Date(Date.now() + 3 * 60 * 1000),
    //   });
    //   await interaction.reply({
    //     content: `✅ Got it! I’ll DM you the reminder.`,
    //     ephemeral: true,
    //   });
    // } catch (error) {
    //   await interaction.reply({
    //     content: `There was an error setting up your reminder. Please try again later. \n ${error}`,
    //     ephemeral: true,
    //   });
    // } finally {
    //   mongoose.connection.close();
    // }
  },
};

export default command;
