import { Events, GuildScheduledEvent } from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import Event from "../models/Event.js";

const event = {
  name: Events.GuildScheduledEventDelete,
  async execute(event: GuildScheduledEvent) {
    try {
      await connectDB();
      const eventDoc = await Event.findOne({ eventId: event.id });

      if (!eventDoc) {
        console.error(
          `Could not find database entry for deleted event ${event.name} (ID: ${event.id})`
        );
        return;
      }

      if (!event.guild) {
        console.error("Event has no guild associated with it");
        return;
      }

      const channel = await event.guild.channels
        .fetch(eventDoc.eventChannelId)
        .catch(() => null);

      if (channel) {
        await channel.delete().catch(() => {});
      }

      await Event.deleteOne({ eventId: event.id });
    } catch (error) {
      console.error("Something went wrong:", error);
    }
  },
};
export default event;
