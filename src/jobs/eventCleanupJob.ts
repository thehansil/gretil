import cron from "node-cron";
import { Client, DiscordAPIError, GuildScheduledEventStatus } from "discord.js";
import Event from "../models/Event.js";
import logError from "../helpers/logError.js";

export default function startEventCleanupJob(client: Client) {
  cron.schedule("0 0 * * *", async () => await runEventCleanupJob(client));
}

export async function runEventCleanupJob(client: Client) {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  console.log(`Running event cleanup job: ${month}/${day}`);

  try {
    const events = await Event.find();
    for (const event of events) {
      try {
        if (
          event.status !== GuildScheduledEventStatus.Completed &&
          event.status !== GuildScheduledEventStatus.Canceled
        ) {
          continue;
        }

        const channel = await client.channels.fetch(event.eventChannelId);
        if (!channel?.isTextBased()) {
          await Event.deleteOne({ _id: event._id });
          console.log(
            `Cleaned event ${event.eventName} (ID: ${event.eventId}).`
          );
          continue;
        }
        const lastMessage = (
          await channel.messages.fetch({ limit: 1 })
        ).first();
        if (!lastMessage) {
          await Event.deleteOne({ _id: event._id });
          console.log(
            `Cleaned event ${event.eventName} (ID: ${event.eventId}).`
          );
          continue;
        }
        const lastMessageDate = lastMessage.createdAt;
        const daysSinceLastMessage =
          (today.getTime() - lastMessageDate.getTime()) / (1000 * 3600 * 24);
        if (daysSinceLastMessage > 7) {
          await channel.delete();
          await Event.deleteOne({ _id: event._id });
          console.log(
            `Cleaned event ${event.eventName} (ID: ${event.eventId}).`
          );
        }
      } catch (error) {
        if (error instanceof DiscordAPIError && error.code === 10003) {
          try {
            await Event.deleteOne({ _id: event._id });
            console.log(
              `Cleaned event ${event.eventName} (ID: ${event.eventId}).`
            );
          } catch (deleteError) {
            await logError(
              client,
              deleteError,
              "Error cleaning orphaned event."
            );
          }
          continue;
        }
        await logError(client, error, "Error cleaning event.");
      }
    }
  } catch (error) {
    await logError(client, error, "Error cleaning events.");
  }
}
