import mongoose from "mongoose";
const { Schema, model } = mongoose;

const birthdaySchema = new Schema({
  userId: { type: String, required: true },
  month: { type: String, required: true },
  day: { type: String, required: true },
});

const Birthday = model("Birthday", birthdaySchema);
export default Birthday;
