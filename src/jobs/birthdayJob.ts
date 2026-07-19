import cron from "node-cron";
import Birthday from "../models/Birthday.js";
import { Client, TextChannel } from "discord.js";
import logError from "../helpers/logError.js";

export default function startDailyBirthdayJob(client: Client) {
  runBirthdayJob(client);
  cron.schedule(
    process.env.BIRTHDAY_CRON_SCHEDULE || "0 9 * * *",
    async () => runBirthdayJob(client),
    {
      timezone: process.env.TIMEZONE || "America/New_York",
    }
  );
}

async function runBirthdayJob(client: Client) {
  if (!process.env.BIRTHDAY_CHANNEL_ID || !process.env.GUILD_ID) {
    await logError(
      client,
      new Error(
        "Birthday channel ID or guild ID not set in environment variables. Birthday job will not run."
      ),
      "Birthday job configuration error."
    );
    return;
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  console.log(`Running daily birthday job: ${month}/${day}`);

  try {
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
      const user = await guild?.members
        .fetch(birthday.userId)
        .catch(() => null);
      if (user) {
        console.log(`Sending birthday message to ${user.user.tag}`);
        await channel.send(`🎉 Happy Birthday, ${user}!  🎂🥳🎊🎁🍾`);
      }
    }
  } catch (error) {
    await logError(client, error, "Error fetching birthdays.");
  }
}
