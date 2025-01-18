import * as dotenv from "@dotenvx/dotenvx";
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

client.on("interactionCreate", async (interaction) => {
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
   } else if (interaction.commandName === "update-channel-names") {
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
   } else if (interaction.commandName === "tog-new") {
      //make sure this was sent in the right channel
      if (interaction.channel.name === "tog") {
         //find what the last chapter was by viewing last message
         const channel = interaction.channel;
         try {
            // Fetch the last message in the channel
            const messages = await channel.messages
               .fetch()
               .then((messages) =>
                  messages.filter((message) => message.author.id === process.env.APP_ID)
               )
               .catch(console.error);
            const lastMessage = messages.first();

            if (lastMessage) {
               //[season 2] Ep. 121 won't work, but #312 will
               //array of all numbers found
               const numbers = lastMessage.content.match(/\d+/g);
               if (numbers) {
                  const lastChapter = Number(numbers[0]);
                  interaction.reply(`Chapter #${lastChapter + 1} discussion thread 🔔`);
               } else {
                  interaction.reply({
                     content: "There was an issue finding the chapter # in the previous message",
                     ephemeral: true,
                  });
               }
            } else {
               interaction.reply({
                  content: "There are no messages in this channel yet.",
                  ephemeral: true,
               });
            }
         } catch (error) {
            console.error("Error fetching messages:", error);
            interaction.reply({
               content: "Failed to fetch the last message in this channel.",
               ephemeral: true,
            });
         }
      } else {
         interaction.reply({
            content: "This is not the right channel for this command. Please send in #tog",
            ephemeral: true,
         });
      }
   }
});

client.login(process.env.TOKEN);
