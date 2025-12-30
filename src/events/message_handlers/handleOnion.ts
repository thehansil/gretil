import { Message } from "discord.js";

export default async function handleOnion(message: Message) {
  const user = await message.guild.members
    .fetch(process.env.ONION_HATER_ID)
    .catch(() => null);
  if (!user) return;
  await message.react("🧅");
  const randomNumber = Math.floor(Math.random() * 3) + 1;
  let response: string;
  switch (randomNumber) {
    case 1:
      response = `🚨🚨 Onion alert level RED! Paging ${user}`;
      break;
    case 2:
      response = `🧅Onions🧅 have entered the chat. ${user}`;
      break;
    case 3:
      response = `👀 Did someone just say… onions? ${user} is NOT going to like this.`;
      break;
  }
  await message.channel.send(response);
}
