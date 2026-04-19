import mongoose from "mongoose";
const { Schema, model } = mongoose;

const eventSchema = new Schema({
  eventId: { type: String, required: true },
  eventName: { type: String, required: true },
  eventChannelId: { type: String, required: true },
});

const Event = model("Event", eventSchema);
export default Event;
