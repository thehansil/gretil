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
  .filter(
    (f) => f.endsWith(".js") && !f.endsWith(".js.map") && !f.endsWith(".d.ts")
  );

for (const file of commandFiles) {
  const filePath = path.join(foldersPath, file);

  let imported;
  try {
    imported = await import(`file://${filePath}`);
  } catch (err) {
    console.error(`[ERROR] Failed to import ${file}:`, err);
    continue;
  }
  const command = imported.default ?? imported;
  if (command?.data && command?.execute) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(
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
