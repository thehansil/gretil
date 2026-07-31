import { Events, Interaction, MessageFlags } from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";
import handleRemindModalSubmit from "./interaction-handlers/handleRemindModalSubmit.js";

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
        await handleRemindModalSubmit(interaction);
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
