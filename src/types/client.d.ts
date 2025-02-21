import { Collection } from "discord.js";
import { Command } from "./config.js";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}
