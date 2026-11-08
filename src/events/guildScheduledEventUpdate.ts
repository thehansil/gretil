import { Events, GuildScheduledEvent } from "discord.js";
import connectDB from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";
import Event from "../models/Event.js";

async function handleRenamedEvent(
  oldEvent: GuildScheduledEvent,
  newEvent: GuildScheduledEvent
) {
  if (oldEvent.name === newEvent.name) {
    return;
  }

  const eventDoc = await Event.findOne({ eventId: newEvent.id });

  if (!eventDoc) {
    await logError(
      newEvent.client,
      new Error(
        `Could not find database entry for event ${newEvent.name} (ID: ${newEvent.id})`
      ),
      "Guild scheduled event update error."
    );
    return;
  }

  const eventChannel = await newEvent.guild?.channels.fetch(
    eventDoc.eventChannelId
  );

  if (!eventChannel) {
    await logError(
      newEvent.client,
      new Error(
        `Could not find channel for event ${newEvent.name} (ID: ${newEvent.id})`
      ),
      "Guild scheduled event update error."
    );
    return;
  }

  const renameSucceeded = await eventChannel
    .edit({ name: newEvent.name.toLowerCase().replace(/\s+/g, "-") })
    .then(() => true)
    .catch(async () => {
      await logError(
        newEvent.client,
        new Error(
          `Failed to update channel name for event ${newEvent.name} (ID: ${newEvent.id})`
        ),
        "Guild scheduled event update error."
      );
      return false;
    });

  if (!renameSucceeded) {
    return;
  }

  eventDoc.eventName = newEvent.name;
  await eventDoc.save();
}

const event = {
  name: Events.GuildScheduledEventUpdate,
  async execute(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) {
    try {
      await connectDB();
      if (!newEvent.guild) {
        await logError(
          newEvent.client,
          new Error("Updated event has no guild associated with it"),
          "Guild scheduled event update error."
        );
        return;
      }
      if (newEvent.name !== oldEvent.name) {
        await handleRenamedEvent(oldEvent, newEvent);
      }
      await Event.updateOne(
        { eventId: newEvent.id },
        { status: newEvent.status }
      );
    } catch (error) {
      await logError(
        newEvent.client,
        error,
        "Something went wrong updating event."
      );
    }
  },
};
export default event;
