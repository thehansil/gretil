import { Message } from "discord.js";
import logError from "../../helpers/logError.js";

// Cooldown tracking for onion mentions (1 hour = 3600000 ms)
const ONION_COOLDOWN_MS = process.env.ONION_COOLDOWN_MS
  ? parseInt(process.env.ONION_COOLDOWN_MS)
  : 3600000;
const onionCooldowns = new Map<string, number>();

export default async function handleOnionMessage(message: Message) {
  try {
    if (!message.channel.isSendable()) return;
    if (!process.env.ONION_HATER_ID) return;

    const now = Date.now();
    const lastTrigger = onionCooldowns.get(message.channelId);
    if (lastTrigger && now - lastTrigger < ONION_COOLDOWN_MS) return;

    const user = await message.guild?.members.fetch(process.env.ONION_HATER_ID);

    onionCooldowns.set(message.channelId, now);

    await message.react("🧅");
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    let response = "";
    switch (randomNumber) {
      case 1:
        response = `🚨🚨 Onion alert level RED! Paging ${user?.toString()}`;
        break;
      case 2:
        response = `🧅Onions🧅 have entered the chat. ${user?.toString()}`;
        break;
      case 3:
        response = `👀 Did someone just say… onions? ${user?.toString()} is NOT going to like this.`;
        break;
    }
    await message.channel.send(response);
  } catch (error) {
    await logError(message.client, error, "Failed to handle onion mention.");
  }
}
