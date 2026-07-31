import * as dotenv from "@dotenvx/dotenvx";
dotenv.config();
import { Client, GatewayIntentBits, Collection } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { Command } from "./types/Command.js";
import { Event } from "./types/Event.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
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
  const { default: command } = (await import(filePath)) as {
    default: Command;
  };

  // Set a new item in the Collection with the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
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
  const { default: event } = (await import(filePath)) as {
    default: Event;
  };
  if (event.once) {
    client.once(event.name, (...args) => void event.execute(...args));
  } else {
    client.on(event.name, (...args) => void event.execute(...args));
  }
}

await client.login(process.env.TOKEN);
