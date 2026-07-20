import { Client, Events } from "discord.js";
import startDailyBirthdayJob from "../jobs/birthdayJob.js";
import startReminderJob from "../jobs/reminderJob.js";
import { connectDB } from "../helpers/dbInitialize.js";
import logError from "../helpers/logError.js";

const event = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log(`✅ Ready! Logged in as ${client.user?.tag}`);
    try {
      await connectDB();
      startDailyBirthdayJob(client);
      startReminderJob(client);
    } catch (error) {
      await logError(client, error, "Failed during startup initialization.");
    }
  },
};
export default event;
