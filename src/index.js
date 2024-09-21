import * as dotenv from "dotenv";
dotenv.config();
import { Client, Events, GatewayIntentBits, Guild, ChannelType } from "discord.js";

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
   ],
});

client.once(Events.ClientReady, (c) => {
   console.log(`✅ Ready! Logged in as ${c.user.tag}`);
});

client.on("messageCreate", (message) => {
   if (message.author.bot) return;

   if (message.content?.toLowerCase() === "hello") {
      message.reply("Hi!");
   }
});

client.on("interactionCreate", (interaction) => {
   if (!interaction.isChatInputCommand()) return;
   if (interaction.commandName === "update-channel-name") {
      let newName = interaction.options.get("name").value;
      let channelNum = interaction.options.get("number").value;
      let voiceChannels = client.guilds.cache
         .get(process.env.GUILD_ID)
         .channels.cache.filter((c) => c.type === ChannelType.GuildVoice);
      if (newName !== null) {
         voiceChannels.at(channelNum - 1).setName(newName);
         interaction.reply({
            content: "Channel name updated!",
            ephemeral: true,
         });
      }
   }

   if (interaction.commandName === "update-channel-names") {
      let newNames = interaction.options.get("names").value;
      if (newNames !== null && newNames.includes(",")) {
         newNames = newNames.split(",");
         let voiceChannels = client.guilds.cache
            .get(process.env.GUILD_ID)
            .channels.cache.filter((c) => c.type === ChannelType.GuildVoice);
         if (newNames.length !== voiceChannels.size) {
            interaction.reply({
               content: "An incorrect number of channel names were provided",
               ephemeral: true,
            });
            return;
         }

         voiceChannels = Array.from(voiceChannels.values());
         for (let i = 0; i < voiceChannels.length; i++) {
            voiceChannels[i].setName(newNames[i]);
         }

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
   }
});

client.login(process.env.TOKEN);
