import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";
import Birthday from "../models/Birthday.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("set-birthday")
    .setDescription("Set your birthday")
    .addStringOption((option) =>
      option.setName("month").setDescription("Month (1-12)").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("day").setDescription("Day (1-31)").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    //const client = interaction.client;

    //get input
    const userId = interaction.user.id;
    let month = interaction.options.get("month").value as string;
    let day = interaction.options.get("day").value as string;

    if (isNaN(Number(month)) || isNaN(Number(day))) {
      await interaction.reply({
        content: "Please enter valid numbers for month and day.",
        ephemeral: true,
      });
      return;
    }
    if (Number(month) < 1 || Number(month) > 12) {
      await interaction.reply({
        content: "Please enter a valid month (1-12)",
        ephemeral: true,
      });
      return;
    }
    if (Number(day) < 1 || Number(day) > 31) {
      await interaction.reply({
        content: "Please enter a valid day (1-31)",
        ephemeral: true,
      });
      return;
    }

    // fix the month and day to be 2 digits if they aren't already
    month = month.length === 1 ? `0${month}` : month;
    day = day.length === 1 ? `0${day}` : day;

    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const existingRecord = await Birthday.findOne({ userId });
      if (existingRecord) {
        existingRecord.month = month;
        existingRecord.day = day;
        await existingRecord.save();
        await interaction.reply({
          content: "Your birthday has been updated!",
          ephemeral: true,
        });
      } else {
        await Birthday.create({
          userId: userId,
          month: month,
          day: day,
        });
        await interaction.reply({
          content: "Your birthday has been saved!",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error saving birthday:", error);
      await interaction.reply({
        content:
          "There was an error saving your birthday. Please try again later.",
        ephemeral: true,
      });
    } finally {
      mongoose.connection.close();
    }
  },
};

export default command;
