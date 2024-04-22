import * as dotenv from "dotenv";
dotenv.config();
import { REST, Routes, ApplicationCommandOptionType } from "discord.js";

const commands = [
  {
    name: "update-channel-names",
    description: "Updates the channel names of the server",
    options: [
      {
        name: "names",
        description: "Comma separated channel names.",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands were registered successfully.");
  } catch (error) {
    console.error(`There was an error: ${error}`);
  }
})();
