import * as dotenv from "@dotenvx/dotenvx";
dotenv.config();
import { REST, Routes } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const commands = [];
const foldersPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "commands"
);
const commandFiles = fs
  .readdirSync(foldersPath)
  .filter((f) => f.endsWith(".js") || f.endsWith(".ts"));

for (const file of commandFiles) {
  const filePath = path.join(foldersPath, file);
  const { default: command } = await import(`${filePath}`);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log("Slash commands were registered successfully.");
  } catch (error) {
    console.error(`There was an error: ${error}`);
  }
})();
