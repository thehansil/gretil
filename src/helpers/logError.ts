import { Client } from "discord.js";

export default async function logError(
  client: Client,
  error: Error,
  message: string
) {
  console.error(message, error);

  if (!process.env.ADMIN_CHANNEL_ID || !process.env.ADMIN_USER_ID) {
    console.error(
      "Admin channel ID or user ID not set in environment variables. Cannot log error to Discord."
    );
    return;
  }

  const errorMessage = error?.message || "No message available";
  const errorStack = error?.stack
    ? `\n\nStack Trace:\n\`\`\`\n${error.stack}\n\`\`\``
    : "";
  const admin = await client.users
    .fetch(process.env.ADMIN_USER_ID)
    .catch(() => null);

  let content = `${admin} ⚠️ There was an error with the bot: ${message}\n\`\`\`${errorMessage}\`\`\`${errorStack}`;

  if (content.length > 2000) {
    content = content.slice(0, 1975) + "\n[Message truncated]";
  }

  const channel = await client.channels.fetch(process.env.ADMIN_CHANNEL_ID);
  if (channel?.isSendable()) {
    await channel.send(content);
  }
}
