import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Birthday from "../models/Birthday.js";
import { connectDB } from "../helpers/dbInitialize.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("delete-birthday")
    .setDescription("Remove your birthday"),

  async execute(interaction: ChatInputCommandInteraction) {
    await connectDB();
    const userId = interaction.user.id;
    try {
      await Birthday.deleteOne({ userId });
      await interaction.reply({
        content: "Your birthday has been removed.",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error removing birthday:", error);
      await interaction.reply({
        content:
          "There was an error removing your birthday. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
