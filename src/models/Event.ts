import mongoose from "mongoose";
import { GuildScheduledEventStatus } from "discord.js";

const { Schema, model } = mongoose;

interface IEvent {
  eventId: string;
  eventName: string;
  eventChannelId: string;
  status?: GuildScheduledEventStatus;
}

const eventSchema = new Schema<IEvent>({
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  eventChannelId: { type: String, required: true },
  status: { type: Number },
});

const Event = model<IEvent>("Event", eventSchema);
export default Event;
