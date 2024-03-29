import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";
import { find_colname, insert_colname } from "../../utils";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} loaded`,
	execute: (client: Client) => {
		const guildID = "913987561922396190",
			channel_monitor_ID = "921456103722721303",
			hallOfFame = "955133343094165594";

		if (!guildID || !channel_monitor_ID || !hallOfFame) return logger.warn("guild or channel ID not set!");

		// get guild by id
		const guild = client.guilds.cache.get(guildID);
		if (!guild) return logger.warn("Invalid guild for message spotlight");

		// get channel by id
		const channel_spotlight = guild.channels.cache.get(hallOfFame) as TextChannel;
		if (!channel_spotlight) return logger.warn("Invalid channel for message spotlight");

		// listener for a channel message
		client.on("messageCreate", async (message) => {
			try {
				if (!channel_monitor_ID.includes(message.channel.id)) return;
				if (message.author.bot) return;

				let imgExist = true;

				// check if message has an image
				if (message.attachments.size === 0) imgExist = false;

				// check if message has a link
				// a video/img as a link will be shown as embed
				if (message.embeds.length > 0) imgExist = true;

				if (imgExist) {
					// add a reaction to the message
					message.react("👍");
					message.react("👎");
					message.react("😂");
				}
			} catch (e) {
				logger.error(`[ERROR] [message-spotlight - adding reaction] ${e}`);
			}
		});

		client.on("messageReactionAdd", async (reaction, user) => {
			try {
				if (!reaction.message.guild) return; // make sure it is in a guild
				if (reaction.message.guild.id !== guild.id) return; // make sure it is in the same guild
				if (!channel_monitor_ID.includes(reaction.message.channel.id)) return; // make sure the correct channel is being monitored

				const msg = await reaction.message.channel.messages.fetch(reaction.message.id); // fetch the message

				// get the msg and reactor object
				const reactor = await msg.guild!.members.fetch(user.id);
				
				// make sure user is admin
				if (!reactor.permissions.has("Administrator")) return;

				// check reaction content
				if (!reaction.emoji.name!.includes("SETUJUBANH")) return;

				// -------------------------------------
				// make sure it's not a dupe or already in the DB
				const data = {
					guildID: guildID,
					channelID: reaction.message.channel.id,
					messageID: reaction.message.id,
				};

				const db_Data = (await find_colname("hall_of_fame", data)) as (typeof data)[];
				if (db_Data.length > 0) return; // if already in db, return

				// insert to db if not already in db
				await insert_colname("hall_of_fame", data);

				// -------------------------------------
				// random footer
				const footerChoice = ["💎", "⭐⭐⭐⭐⭐", "😂👆", "😂👆", "Pengememe handal"];

				// verify attachment
				let attachment = msg.attachments.size > 0 ? msg.attachments.first()!.url : ""; // if an attachment (ANY)
				if (attachment === "" && msg.embeds.length > 0 && (msg.embeds[0].image || msg.embeds[0].video)) attachment = msg.embeds[0].data.url!; // if embedded link (IMAGE)

				const embed = new EmbedBuilder()
					.setColor("Aqua")
					.setAuthor({
						name: msg.author.username,
						iconURL: msg.author.displayAvatarURL({ extension: "png", size: 2048 }),
						url: `https://discord.com/channels/${guildID}/${reaction.message.channel.id}/${reaction.message.id}`,
					})
					.addFields([{ name: `Source`, value: `[Jump](https://discord.com/channels/${guildID}/${reaction.message.channel.id}/${reaction.message.id})`, inline: true }])
					.setFooter({ text: footerChoice[Math.floor(Math.random() * footerChoice.length)] })
					.setTimestamp();

				if (msg.toString().length > 0) embed.setDescription(msg.toString());
				if (attachment !== "") {
					embed.setImage(attachment);
					embed.addFields([{ name: `Attachment`, value: `[Link](${attachment})`, inline: true }]);
				}

				// send the message 🚀
				channel_spotlight.send({ content: `<#${reaction.message.channel.id}> ${msg.author}`, embeds: [embed] });

				// -------------------------------------
				// check if attachment is a video
				// if a video then send it separately 🚀
				if (attachment.includes(".mp4")) channel_spotlight.send({ content: attachment });

				// if a video but embedded because it is a link 🚀
				if (msg.embeds.length > 0) if (msg.embeds[0].video) channel_spotlight.send({ content: msg.embeds[0].video.url! });
			} catch (e) {
				logger.error(`[ERROR] [hall-of-fame] ${e}`);
			}
		});
	},
};

export default event;
