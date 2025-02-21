import {
  ChannelType,
  ChatInputCommandInteraction,
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
    const client = interaction.client;
    const newNames = interaction.options.get("names").value as string;
    if (newNames !== null && newNames.includes(",")) {
      const namesArray = newNames.split(",");
      const voiceChannels = client.guilds.cache
        .get(process.env.GUILD_ID)
        .channels.cache.filter((c) => c.type === ChannelType.GuildVoice);
      if (namesArray.length !== voiceChannels.size) {
        await interaction.reply({
          content: "An incorrect number of channel names was provided",
          ephemeral: true,
        });
        return;
      }

      [...voiceChannels.values()].forEach(async (channel, index) => {
        await channel.setName(namesArray[index]);
      });

      interaction.reply({
        content: "Channel names updated!",
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: "The channel names given need to have a ',' between each name",
        ephemeral: true,
      });
    }
  },
};

export default command;
