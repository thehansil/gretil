import { Client, EmbedBuilder, Colors, type APIEmbedField } from "discord.js";

const MAX_DESCRIPTION_LENGTH = 4096;
const MAX_FIELD_LENGTH = 1024;

export default async function logError(
  client: Client,
  error: unknown,
  message: string
): Promise<void> {
  const err =
    error instanceof Error
      ? error
      : new Error(
          typeof error === "string" ? error : JSON.stringify(error, null, 2)
        );

  console.error(message, err);

  const { ADMIN_CHANNEL_ID, ADMIN_USER_ID } = process.env;

  if (!ADMIN_CHANNEL_ID || !ADMIN_USER_ID) {
    console.error(
      "ADMIN_CHANNEL_ID or ADMIN_USER_ID is not set. Skipping Discord error notification."
    );
    return;
  }

  try {
    const channel = await client.channels.fetch(ADMIN_CHANNEL_ID);

    if (!channel?.isSendable()) {
      console.error("Admin channel is not sendable.");
      return;
    }

    const fields: APIEmbedField[] = [
      {
        name: "Error",
        value: `\`\`\`\n${err.message.slice(0, MAX_FIELD_LENGTH - 8)}\n\`\`\``,
      },
    ];

    if (err.stack) {
      fields.push({
        name: "Stack Trace",
        value: `\`\`\`\n${err.stack.slice(0, MAX_FIELD_LENGTH - 8)}\n\`\`\``,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle("⚠️ Gretil Error")
      .setDescription(message.slice(0, MAX_DESCRIPTION_LENGTH))
      .addFields(fields)
      .setTimestamp();

    const mention = `<@${ADMIN_USER_ID}>`;

    await channel.send({
      content: mention,
      embeds: [embed],
    });
  } catch (loggingError) {
    console.error(
      "Failed to send error notification to Discord:",
      loggingError
    );
  }
}
