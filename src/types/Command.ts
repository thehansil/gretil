import {
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder | ContextMenuCommandBuilder;
  execute(
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
  ): Promise<void>;
}
