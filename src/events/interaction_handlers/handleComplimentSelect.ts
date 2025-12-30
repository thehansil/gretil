export default async function handleComplimentSelect(interaction) {
  const type = interaction.values[0];

  const compliments = {
    physical: [
      "You have a great sense of style.",
      "You carry yourself with confidence.",
    ],
    intelligence: [
      "You pick things up incredibly fast.",
      "You have a sharp, analytical mind.",
    ],
    personality: [
      "People feel comfortable around you.",
      "You bring positive energy wherever you go.",
    ],
  };

  const pool =
    type === "random" ? Object.values(compliments).flat() : compliments[type];

  const compliment = pool[Math.floor(Math.random() * pool.length)];

  await interaction.update({
    content: `💖 **Compliment for you:**\n${compliment}`,
    components: [],
  });
}
