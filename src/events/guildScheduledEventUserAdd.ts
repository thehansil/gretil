import {
  ChannelType,
  Events,
  GuildMember,
  GuildScheduledEvent,
} from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import Event from "../models/Event.js";

const event = {
  name: Events.GuildScheduledEventUserAdd,
  async execute(event: GuildScheduledEvent, user: GuildMember) {
    try {
      await connectDB();
      const eventDoc = await Event.findOne({ eventId: event.id });

      if (!eventDoc) {
        console.error(
          `Could not find database entry for deleted event ${event.name} (ID: ${event.id})`
        );
        return;
      }

      const channel = await event.guild.channels
        .fetch(eventDoc.eventChannelId)
        .catch(() => null);

      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error(
          "Associated channel not found or is not a text channel for event ID:",
          event.id
        );
        return;
      }

      await channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
    } catch (error) {
      console.error("Something went wrong:", error);
    }
  },
};
export default event;
