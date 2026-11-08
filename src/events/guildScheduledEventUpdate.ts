import {
  Events,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
} from "discord.js";
import connectDB from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";
import Event from "../models/Event.js";

async function handleDeletedEvent(newEvent: GuildScheduledEvent) {
  const event = await Event.findOne({ eventId: newEvent.id });
  if (!event) {
    await logError(
      newEvent.client,
      new Error(
        `Could not find database entry for completed event ${newEvent.name} (ID: ${newEvent.id})`
      ),
      "Guild scheduled event update error."
    );
    return;
  }

  const channel = await newEvent.guild?.channels.fetch(event.eventChannelId);
  if (channel) {
    await channel.delete().catch(() => {});
  } else {
    await logError(
      newEvent.client,
      new Error(
        `Could not find channel for event ${newEvent.name} (ID: ${newEvent.id})`
      ),
      "Guild scheduled event update error."
    );
  }

  await Event.deleteOne({ eventId: newEvent.id });
}

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
      if (
        oldEvent.status !== GuildScheduledEventStatus.Completed &&
        newEvent.status === GuildScheduledEventStatus.Completed
      ) {
        // Temporarily disable delete. Instantly deleting removes continued
        // commmunication after the event. Needs to be delayed or handled manually
        // await handleDeletedEvent(newEvent);
      } else {
        await handleRenamedEvent(oldEvent, newEvent);
      }
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
