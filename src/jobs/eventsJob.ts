// import cron from "node-cron";
// import Event from "../models/Event.js";
// import {
//   Client,
//   Guild,
//   GuildScheduledEventStatus,
//   PermissionsBitField,
//   Routes,
//   TextChannel,
// } from "discord.js";

// export default function startEventManagerJob(client: Client) {
//   runEventManagerJob(client);
//   //   cron.schedule("* * * * *", async () => runEventManagerJob(client), {
//   //     timezone: process.env.TIMEZONE || "America/New_York",
//   //   });
// }

// async function runEventManagerJob(client: Client) {
//   const guild = await client.guilds.fetch(process.env.GUILD_ID!);
//   // Get a list of all events from the server
//   const events = await guild.scheduledEvents.fetch();

//   events.forEach(async (event) => {
//     //console.log("Event:\n", event);
//     const interestedUsers = await event
//       .fetchSubscribers()
//       .then((subscribers) => subscribers.map((s) => s.user.id));

//     if (event.status !== GuildScheduledEventStatus.Canceled) {
//       const existingRecord = await Event.findOne({ id: event.id });
//       if (!existingRecord) {
//         const newEvent = new Event({
//           id: event.id,
//           name: event.name,
//           description: event.description || "",
//           scheduledStartAt: event.scheduledStartAt,
//           scheduledEndAt: event.scheduledEndAt,
//           status: event.status,
//         });
//         await newEvent.save();

//         const overwrites = [
//           {
//             id: event.guild.roles.everyone.id,
//             deny: [PermissionsBitField.Flags.ViewChannel],
//           },
//         ];

//         interestedUsers.forEach((user: ) => {
//           overwrites.push({
//             id: user.id,
//             allow: [
//               PermissionsBitField.Flags.ViewChannel,
//               PermissionsBitField.Flags.SendMessages,
//               PermissionsBitField.Flags.ReadMessageHistory,
//             ],
//           });
//         });

//         const channel = await guild.channels.create({
//           name: `event-${event.name.toLowerCase().replace(/\s+/g, "-")}`,
//           type: 0,
//           permissionOverwrites: [
//             {
//               id: process.env.GUILD_ID!,
//               deny: ["ViewChannel"],
//             },
//           ],
//         });

//         newEvent.eventChannelId = channel.id;
//         await newEvent.save();
//       }
//     }
//   });

//   // Check which events are not already in the database
//   // For each new event, add it to the database and create a new private channel for it
//   // For all events that are in the database, check which members have marked interested and add them to the channel
//   // For all events, update with new information from the server (name, description, time, etc.)
//   // remove all other members from the channel
//   // If the event has already passed, remove it from the database and delete the channel
// }
