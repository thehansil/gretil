import {
  ChannelType,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("update-channel-names")
    .setDescription("Update the names of all voice channels")
    .addStringOption((option) =>
      option.setName("names").setDescription("Channel names").setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const newNames = interaction?.options.get("names")?.value as string;
    if (newNames !== null && newNames.includes(",")) {
      const namesArray = newNames.split(",");
      const guild = interaction.guild;
      if (!guild) {
        await interaction.reply({
          content: "Guild not found or not configured properly",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const fetchedChannels = await guild.channels.fetch();
      const voiceChannels = fetchedChannels?.filter(
        (c) => c?.type === ChannelType.GuildVoice
      );
      if (namesArray.length !== voiceChannels.size) {
        await interaction.reply({
          content: "An incorrect number of channel names was provided",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await Promise.all(
        [...voiceChannels.values()].map((channel, index) =>
          channel.setName(namesArray[index])
        )
      );

      await interaction.reply({
        content: "Channel names updated!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "The channel names given need to have a ',' between each name",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
