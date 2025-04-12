import { Client, Events } from "discord.js";
import startDailyBirthdayJob from "../jobs/birthdayJob.js";

const event = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`✅ Ready! Logged in as ${client.user.tag}`);
    startDailyBirthdayJob(client);
  },
};
export default event;
