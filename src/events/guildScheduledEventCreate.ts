import {
  ChannelType,
  Events,
  GuildScheduledEvent,
  OverwriteType,
  PermissionsBitField,
} from "discord.js";
import { connectDB } from "../helpers/dbInitialize.js";
import Event from "../models/Event.js";

const event = {
  name: Events.GuildScheduledEventCreate,
  async execute(event: GuildScheduledEvent) {
    try {
      if (!event.guild) {
        console.error("Event has no guild associated with it");
        return;
      }
      const creator = event.creatorId
        ? await event.guild.members.fetch(event.creatorId).catch(() => null)
        : null;

      if (!creator) {
        console.error(
          `Could not fetch creator for event ${event.name} (ID: ${event.id})`
        );
        return;
      }

      const overwrites = [
        {
          id: event.guild.roles.everyone.id,
          type: OverwriteType.Role,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: creator.id,
          type: OverwriteType.Member,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ];

      const category = event.guild.channels.cache.find(
        (c) => c.name === "Events" && c.type === ChannelType.GuildCategory
      );

      const eventChannel = await event.guild.channels.create({
        name: event.name.toLowerCase().replace(/\s+/g, "-"),
        type: ChannelType.GuildText,
        permissionOverwrites: overwrites,
        parent: category?.id,
      });

      if (!eventChannel) {
        console.error("Failed to create event channel");
        return;
      }

      await connectDB();

      await Event.create({
        eventId: event.id,
        eventName: event.name,
        eventChannelId: eventChannel.id,
      });
    } catch (error) {
      console.error("Something went wrong creating event:", error);
    }
  },
};
export default event;
