import { ChannelType, Events, GuildScheduledEvent } from "discord.js";
import connectDB from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";
import Event from "../models/Event.js";

const event = {
  name: Events.GuildScheduledEventCreate,
  async execute(event: GuildScheduledEvent) {
    try {
      await connectDB();
      if (!event.guild) {
        await logError(
          event.client,
          new Error("Event has no guild associated with it"),
          "Guild scheduled event create error."
        );
        return;
      }

      const channels = await event.guild.channels.fetch();

      const category = channels.find(
        (c) => c?.name === "Events" && c.type === ChannelType.GuildCategory
      );

      const eventChannel = await event.guild.channels.create({
        name: event.name.toLowerCase().replace(/\s+/g, "-"),
        type: ChannelType.GuildText,
        parent: category?.id,
      });

      await Event.create({
        eventId: event.id,
        eventName: event.name,
        eventChannelId: eventChannel.id,
      });
    } catch (error) {
      await logError(
        event.client,
        error,
        "Something went wrong creating event."
      );
    }
  },
};
export default event;
