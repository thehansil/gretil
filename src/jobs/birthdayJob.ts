import cron from "node-cron";
import mongoose from "mongoose";
import Birthday from "../models/Birthday.js";
import { Client, TextChannel } from "discord.js";

export default function startDailyBirthdayJob(client: Client) {
  cron.schedule("0 9 * * *", async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    console.log(`Running daily birthday job: ${month}/${day}`);

    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const birthdays = await Birthday.find({ month, day });
      if (birthdays.length === 0) {
        console.log("No birthdays today.");
        return;
      }
      const channel = (await client.channels.fetch(
        process.env.BIRTHDAY_CHANNEL_ID
      )) as TextChannel;
      const guild = client.guilds.cache.get(process.env.GUILD_ID);

      for (const birthday of birthdays) {
        const user = await guild.members
          .fetch(birthday.userId)
          .catch(() => null);
        if (user) {
          console.log(`Sending birthday message to ${user.user.tag}`);
          await channel.send(`🎉 Happy Birthday, ${user}!  🎂🥳🎊🎁🍾`);
        }
      }
    } catch (error) {
      console.error("Error fetching birthdays:", error);
    } finally {
      mongoose.connection.close();
    }
  });
}
