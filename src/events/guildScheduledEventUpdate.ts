import {
  Events,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
} from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import Event from "../models/Event.js";

const event = {
  name: Events.GuildScheduledEventUpdate,
  async execute(oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) {
    try {
      await connectDB();
      if (
        oldEvent.status !== GuildScheduledEventStatus.Completed &&
        newEvent.status === GuildScheduledEventStatus.Completed
      ) {
        const event = await Event.findOne({ eventId: newEvent.id });
        const channel = await newEvent.guild.channels
          .fetch(event.eventChannelId)
          .catch(() => null);
        if (channel) {
          await channel.delete().catch(() => {});
        } else {
          console.error(
            `Could not find channel for event ${newEvent.name} (ID: ${newEvent.id})`
          );
        }
      } else if (oldEvent.name !== newEvent.name) {
        const eventDoc = await Event.findOne({ eventId: newEvent.id });

        if (!eventDoc) {
          console.error(
            `Could not find database entry for event ${newEvent.name} (ID: ${newEvent.id})`
          );
          return;
        }

        const eventChannel = await newEvent.guild.channels
          .fetch(eventDoc.eventChannelId)
          .catch(() => null);

        if (!eventChannel) {
          console.error(
            `Could not find channel for event ${newEvent.name} (ID: ${newEvent.id})`
          );
          return;
        }

        await eventChannel
          .edit({ name: newEvent.name.toLowerCase().replace(/\s+/g, "-") })
          .catch(() => {
            console.error(
              `Failed to update channel name for event ${newEvent.name} (ID: ${newEvent.id})`
            );
          });

        eventDoc.eventName = newEvent.name;
        await eventDoc.save();
      }
    } catch (error) {
      console.error("Something went wrong updating event:", error);
    }
  },
};
export default event;
