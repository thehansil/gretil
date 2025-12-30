import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("compliment")
  .setDescription("Get a compliment");

export async function execute(interaction) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("compliment_type")
    .setPlaceholder("Choose a compliment type")
    .addOptions([
      {
        label: "Physical",
        value: "physical",
        emoji: "💪",
      },
      {
        label: "Intelligence",
        value: "intelligence",
        emoji: "🧠",
      },
      {
        label: "Personality",
        value: "personality",
        emoji: "🎨",
      },
      {
        label: "Random",
        value: "random",
        emoji: "🎲",
      },
    ]);

  await interaction.reply({
    content: "What kind of compliment would you like?",
    components: [new ActionRowBuilder().addComponents(menu)],
    ephemeral: true,
  });
}
