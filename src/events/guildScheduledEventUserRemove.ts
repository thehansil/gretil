import {
  ChannelType,
  Events,
  GuildMember,
  GuildScheduledEvent,
} from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";
import Event from "../models/Event.js";

const event = {
  name: Events.GuildScheduledEventUserRemove,
  async execute(event: GuildScheduledEvent, user: GuildMember) {
    try {
      await connectDB();
      const eventDoc = await Event.findOne({ eventId: event.id });

      if (!eventDoc) {
        await logError(
          event.client,
          new Error(
            `Could not find database entry for deleted event ${event.name} (ID: ${event.id})`
          ),
          "Guild scheduled event user remove error."
        );
        return;
      }

      if (!event.guild) {
        await logError(
          event.client,
          new Error("Event has no guild associated with it"),
          "Guild scheduled event user remove error."
        );
        return;
      }

      const channel = await event.guild.channels
        .fetch(eventDoc.eventChannelId)
        .catch(() => null);
      if (!channel || channel.type !== ChannelType.GuildText) {
        await logError(
          event.client,
          new Error(
            `Associated channel not found or is not a text channel for event ID: ${event.id}`
          ),
          "Guild scheduled event user remove error."
        );
        return;
      }

      await channel.permissionOverwrites.delete(user.id);
    } catch (error) {
      await logError(
        event.client,
        error,
        "Something went wrong with event user remove."
      );
    }
  },
};
export default event;
