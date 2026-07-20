import cron from "node-cron";
import Birthday from "../models/Birthday.js";
import { Client } from "discord.js";
import logError from "../helpers/logError.js";

export default function startDailyBirthdayJob(client: Client) {
  cron.schedule(
    process.env.BIRTHDAY_CRON_SCHEDULE || "0 9 * * *",
    async () => await runBirthdayJob(client),
    {
      timezone: process.env.TIMEZONE || "America/New_York",
    }
  );
}

export async function runBirthdayJob(client: Client) {
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
    const channel = await client.channels.fetch(
      process.env.BIRTHDAY_CHANNEL_ID
    );
    if (!channel?.isTextBased() || !("send" in channel)) {
      throw new Error("Birthday channel is not a text channel.");
    }
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    for (const birthday of birthdays) {
      try {
        const user = await guild.members.fetch(birthday.userId);
        console.log(`Sending birthday message to ${user.user.tag}`);
        await channel.send(
          `🎉 Happy Birthday, ${user.toString()}!  🎂🥳🎊🎁🍾`
        );
      } catch (error) {
        await logError(client, error, "Error sending birthday message.");
      }
    }
  } catch (error) {
    await logError(client, error, "Error fetching birthdays.");
  }
}
