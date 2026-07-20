import * as dotenv from "@dotenvx/dotenvx";
dotenv.config();
import { REST, Routes } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { Command } from "./types/Command.js";

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

if (!clientId || !guildId || !token) {
  throw new Error(
    "CLIENT_ID, GUILD_ID, and TOKEN must be set in the environment variables."
  );
}

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
  const module = (await import(filePath)) as {
    default: Command;
  };

  const command = module.default;

  commands.push(command.data.toJSON());
  // const { default: command } = await import(`${filePath}`);
  // if ("data" in command && "execute" in command) {
  //   commands.push(command.data.toJSON());
  // } else {
  //   console.log(
  //     `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
  //   );
  // }
}

const rest = new REST({ version: "10" }).setToken(token);

await (async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log("Slash commands were registered successfully.");
  } catch (error) {
    console.error(`There was an error: ${error}`);
  }
})();
