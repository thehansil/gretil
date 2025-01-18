import * as dotenv from "@dotenvx/dotenvx";
dotenv.config();
import { REST, Routes, ApplicationCommandOptionType } from "discord.js";

const commands = [
   {
      name: "update-channel-name",
      description: "Updates the channel name of the server",
      options: [
         {
            name: "name",
            description: "Channel name",
            type: ApplicationCommandOptionType.String,
            required: true,
         },
         {
            name: "number",
            description: "Voice channel number",
            type: ApplicationCommandOptionType.String,
            required: true,
         },
      ],
   },
   {
      name: "update-channel-names",
      description: "Updates the channel names of the server based on comma separated list",
      options: [
         {
            name: "names",
            description: "Channel names",
            type: ApplicationCommandOptionType.String,
            required: true,
         },
      ],
   },
   {
      name: "tog-new",
      description: "Creates a new channel message for discussion threads",
   },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
   try {
      console.log("Registering slash commands...");

      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
         body: commands,
      });

      console.log("Slash commands were registered successfully.");
   } catch (error) {
      console.error(`There was an error: ${error}`);
   }
})();
