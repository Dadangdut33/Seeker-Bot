import { ChannelType, Client, EmbedBuilder, TextChannel } from "discord.js";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";
import { find_colname, insert_colname } from "../../utils";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} loaded`,
	execute: (client: Client) => {
		const guildID = process.env.PERSONAL_SERVER_ID!,
			channelID = process.env.PERSONAL_SERVER_SPOTLIGHT_CHANNEL_ID!;

		if (!guildID || !channelID) return logger.warn("guild or channel ID not set!");

		// get guild by id
		const guild = client.guilds.cache.get(guildID);
		if (!guild) return logger.warn("Invalid guild for message spotlight");

		// get channel by id
		const channel = guild.channels.cache.get(channelID) as TextChannel;
		if (!channel) return logger.warn("Invalid channel for message spotlight");

		client.on("messageReactionAdd", async (reaction, user) => {
			try {
				if (!reaction.message.guild) return; // make sure it is in a guild
				if (reaction.message.guild.id !== guild.id) return; // make sure it is in the same guild

				// make sure reaction is not in news channel also make sure raction is not in same channel as highlightChannel
				if (reaction.message.channel.type === ChannelType.GuildAnnouncement || reaction.message.channel === channel) return;

				// make sure everyone has access to it
				if (!(reaction.message.channel as TextChannel).permissionsFor(reaction.message.guild.roles.everyone).has("ViewChannel")) return;

				const msg = await reaction.message.channel.messages.fetch(reaction.message.id); // fetch the message

				// make sure user and its reaction to is not bot
				if (user.bot || msg.author.bot) return;

				// count all reactions in the message
				let count = 0;
				reaction.message.reactions.cache.map(async (reaction) => (count += reaction.count!));

				// if reactions >= 3, send it to the highlightChannel
				if (count >= 3) {
					let data = {
							guildID: guildID,
							channelID: reaction.message.channel.id,
							messageID: reaction.message.id,
						},
						db_Data = (await find_colname("spotlighted_message", data)) as (typeof data)[];

					// if already in db, return
					if (db_Data.length > 0) return;

					// insert to db
					await insert_colname("spotlighted_message", data);

					// verify attachment
					let attachment = msg.attachments.size > 0 ? msg.attachments.first()!.url : ""; // if an attachment (ANY)
					if (attachment === "" && msg.embeds.length > 0 && (msg.embeds[0].image || msg.embeds[0].video)) attachment = msg.embeds[0].data.url!; // if embedded link (IMAGE)

					const embed = new EmbedBuilder()
						.setColor("Yellow")
						.setAuthor({
							name: msg.author.username,
							iconURL: msg.author.displayAvatarURL({ extension: "png", size: 2048 }),
							url: `https://discord.com/channels/${guildID}/${reaction.message.channel.id}/${reaction.message.id}`,
						})
						.addFields([{ name: `Source`, value: `[Jump](https://discord.com/channels/${guildID}/${reaction.message.channel.id}/${reaction.message.id})`, inline: true }])
						.setFooter({ text: `✨ Starred` })
						.setTimestamp();

					if (msg.toString().length > 0) embed.setDescription(msg.toString());
					if (attachment !== "") {
						embed.setImage(attachment);
						embed.addFields([{ name: `Attachment`, value: `[Link](${attachment})`, inline: true }]);
					}

					// send the message 🚀
					channel.send({ content: `<#${reaction.message.channel.id}> ${msg.author}`, embeds: [embed] });

					// -------------------------------------
					// check if attachment is a video
					// if a video then send it separately 🚀
					if (attachment.includes(".mp4")) channel.send(attachment);

					// if a video but embedded because it is a link 🚀
					if (msg.embeds.length > 0) if (msg.embeds[0].video) channel.send(msg.embeds[0].video.url!);
				}
			} catch (e) {
				logger.error(e)
				logger.error(`[ERROR] [message-spotlight] ${e}`);
			}
		});
	},
};

export default event;
