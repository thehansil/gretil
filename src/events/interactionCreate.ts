import { Events, Interaction } from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import handleRemindModal from "./interaction_handlers/handleRemindModal.js";
import handleComplimentSelect from "./interaction_handlers/handleComplimentSelect.js";

const event = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isMessageContextMenuCommand() &&
      !interaction.isModalSubmit() &&
      !interaction.isStringSelectMenu()
    )
      return;

    await connectDB();

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("remindModal-")) {
        await handleRemindModal(interaction);
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "compliment") {
        await handleComplimentSelect(interaction);
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
