import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";
import Birthday from "../models/Birthday.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("delete-birthday")
    .setDescription("Remove your birthday"),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      await Birthday.deleteOne({ userId });
      await interaction.reply({
        content: "Your birthday has been removed.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error removing birthday:", error);
      await interaction.reply({
        content:
          "There was an error removing your birthday. Please try again later.",
        ephemeral: true,
      });
    }
  },
};

export default command;
