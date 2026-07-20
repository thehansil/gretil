import { Events, GuildScheduledEvent } from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";
import Event from "../models/Event.js";

const event = {
  name: Events.GuildScheduledEventDelete,
  async execute(event: GuildScheduledEvent) {
    try {
      await connectDB();
      const eventDoc = await Event.findOne({ eventId: event.id });

      if (!eventDoc) {
        await logError(
          event.client,
          new Error(
            `Could not find database entry for deleted event ${event.name} (ID: ${event.id})`
          ),
          "Guild scheduled event delete error."
        );
        return;
      }

      if (!event.guild) {
        await logError(
          event.client,
          new Error("Event has no guild associated with it"),
          "Guild scheduled event delete error."
        );
        return;
      }

      const channel = await event.guild.channels.fetch(eventDoc.eventChannelId);

      if (channel) {
        await channel.delete().catch(() => {});
      }

      await Event.deleteOne({ eventId: event.id });
    } catch (error) {
      await logError(
        event.client,
        error,
        "Something went wrong deleting event."
      );
    }
  },
};
export default event;
