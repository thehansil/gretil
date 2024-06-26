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

   if (interaction.commandName === "update-channel-names") {
      let newNames = interaction.options.get("names").value;
      if (newNames !== null && newNames.includes(",")) {
         newNames = newNames.split(",");
         let voiceChannels = client.guilds.cache
            .get(process.env.GUILD_ID)
            .channels.cache.filter((c) => c.type === ChannelType.GuildVoice);
         //.map((c) => c.id);
         // console.log(voiceChannels);
         voiceChannels.forEach((channel, i) => {
            console.log(`Old Name: ${channel.name} - New Name: ${newNames[i]}`);
            channel.setName(newNames[0]);
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
   }
});

client.login(process.env.TOKEN);
