import { Client, Events } from "discord.js";
import startDailyBirthdayJob from "../jobs/birthdayJob.js";
import startReminderJob from "../jobs/reminderJob.js";

const event = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`✅ Ready! Logged in as ${client.user.tag}`);
    startDailyBirthdayJob(client);
    startReminderJob(client);
  },
};
export default event;
