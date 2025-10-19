import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reminderSchema = new Schema({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  remindAt: { type: Date, required: true },
});

reminderSchema.index({ remindAt: 1 });

const Reminder = model("Reminder", reminderSchema);
export default Reminder;
