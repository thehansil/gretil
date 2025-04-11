import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = {
  data: new SlashCommandBuilder()
    .setName("tog-new")
    .setDescription("Create a new chapter discussion thread for Tower of God"),
  async execute(interaction: ChatInputCommandInteraction) {
    //make sure this was sent in the right channel
    if (interaction.channel.name === "tog") {
      //find what the last chapter was by viewing last message
      const channel = interaction.channel;
      try {
        // Fetch the last message in the channel
        const messages = await channel.messages
          .fetch()
          .then((messages) =>
            messages.filter(
              (message) => message.author.id === process.env.CLIENT_ID
            )
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
              content:
                "There was an issue finding the chapter # in the previous message",
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
        content:
          "This is not the right channel for this command. Please send in #tog",
        ephemeral: true,
      });
    }
  },
};

export default command;
