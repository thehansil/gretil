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

client.on("messageCreate", async (message) => {
   if (message.author.bot) return;

   if (message.content?.toLowerCase() === "hello") {
      message.reply("Hi!");
   }

   if (
      message.content?.includes("https://x.com") ||
      message.content?.includes("https://twitter.com")
   ) {
      try {
         const twitterRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)([^?\s]+)(\?[^\s]*)?/gi;
         const newMessage = message.content.replace(twitterRegex, "https://xcancel.com$3");
         await message.suppressEmbeds(true);
         message.channel.send("Twitterless link:\n" + newMessage);
      } catch (error) {
         console.error("Failed to provide link", error);
      }
   }
});

client.on("interactionCreate", async (interaction) => {
   if (!interaction.isChatInputCommand()) return;
   if (interaction.commandName === "update-channel-name") {
      let newName = interaction.options.get("name").value as string;
      let channelNum = interaction.options.get("number").value as number;
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
      let newNames = interaction.options.get("names").value as string;
      if (newNames !== null && newNames.includes(",")) {
         let namesArray = newNames.split(",");
         let voiceChannels = client.guilds.cache
            .get(process.env.GUILD_ID)
            .channels.cache.filter((c) => c.type === ChannelType.GuildVoice);
         if (namesArray.length !== voiceChannels.size) {
            interaction.reply({
               content: "An incorrect number of channel names was provided",
               ephemeral: true,
            });
            return;
         }
         
         [...voiceChannels.values()].forEach( async (channel, index) => {
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
                  messages.filter((message) => message.author.id === process.env.CLIENT_ID)
               )
               .catch(console.error);
            if (!messages) {
               interaction.reply({
                  content: "Failed to fetch the last thread in this channel.",
                  ephemeral: true,
               });
               return;
            }
            const lastMessage = messages.first();

            if (lastMessage) {
               //[season 2] Ep. 121 won't work, but #312 will
               //array of all numbers found
               const numbers = lastMessage.content.match(/\d+/g);
               if (numbers) {
                  const nextChapter = Number(numbers[0]) + 1;
                  const reply = await interaction.reply({
                     content: `Chapter #${nextChapter} Discussion Thread 🔔`,
                     fetchReply: true,
                  });

                  //Start a thread and add a comment
                  const thread = await reply.startThread({
                     name: `Chapter #${nextChapter} Discussion Thread`,
                     autoArchiveDuration: 10080,
                     reason: "Starting a thread for discussion",
                  });

                  await thread.send("What a chapter...");
               } else {
                  interaction.reply({
                     content: "There was an issue finding the chapter # in the previous message",
                     ephemeral: true,
                  });
               }
            } else {
               const reply = await interaction.reply({
                  content: "Chapter #1 Discussion Thread 🔔",
                  fetchReply: true,
               });

               const thread = await reply.startThread({
                  name: "Chapter #1 Discussion Thread",
                  autoArchiveDuration: 10080,
                  reason: "Starting a thread for discussion",
               });
               await thread.send("What a chapter...");
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
