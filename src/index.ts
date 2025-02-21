import * as dotenv from "@dotenvx/dotenvx";
dotenv.config();
import { Client, GatewayIntentBits, Collection } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const foldersPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "commands"
);
const commandFiles = fs
  .readdirSync(foldersPath)
  .filter((f) => f.endsWith(".js") || f.endsWith(".ts"));

for (const commandFile of commandFiles) {
  const filePath = path.join(foldersPath, commandFile);
  const { default: command } = await import(`./commands/${commandFile}`);

  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const eventsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "events"
);
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const { default: event } = await import(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);
