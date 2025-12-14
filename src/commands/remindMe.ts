import {
  ActionRowBuilder,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

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
  },
};

export default command;
