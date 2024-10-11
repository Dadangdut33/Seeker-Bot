import { ChannelType, Client, EmbedBuilder, TextChannel } from "discord.js";
import { IBotEvent } from "@/types";
import { logger } from "@/logger";
import { env } from "@/env";
import { db } from "@/utils/db";
import { MessageSpotlight } from "@/utils/db/schema";
import { and, eq } from "drizzle-orm";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} loaded`,
	execute: (client: Client) => {
		const g_id = env.PERSONAL_SERVER_ID!,
			ch_id = env.PERSONAL_SERVER_SPOTLIGHT_CHANNEL_ID!;

		if (!g_id || !ch_id) return logger.warn("guild or channel ID not set!");

		// get guild by id
		const guild = client.guilds.cache.get(g_id);
		if (!guild) return logger.warn("Invalid guild for message spotlight");

		// get channel by id
		const channel_spotlight = guild.channels.cache.get(ch_id) as TextChannel;
		if (!channel_spotlight) return logger.warn("Invalid channel for message spotlight");

		client.on("messageReactionAdd", async (reaction, user) => {
			try {
				if (!reaction.message.guild) return; // make sure it is in a guild
				if (reaction.message.guild.id !== guild.id) return; // make sure it is in the same guild

				// make sure reaction is not in news channel also make sure raction is not in same channel as highlightChannel
				if (reaction.message.channel.type === ChannelType.GuildAnnouncement || reaction.message.channel === channel_spotlight) return;

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
					// if already in db, return
					const found = await db.query.MessageSpotlight.findFirst({
						where: and(eq(MessageSpotlight.guild_id, g_id), eq(MessageSpotlight.ch_id, reaction.message.channel.id), eq(MessageSpotlight.msg_id, reaction.message.id)),
					});

					if (found) return;

					// insert to db
					await db.insert(MessageSpotlight).values({ guild_id: g_id, ch_id: reaction.message.channel.id, msg_id: reaction.message.id });

					// verify attachment
					let attachment = msg.attachments.size > 0 ? msg.attachments.first()!.url : ""; // if an attachment (ANY)
					if (attachment === "" && msg.embeds.length > 0 && (msg.embeds[0].image || msg.embeds[0].video)) attachment = msg.embeds[0].data.url!; // if embedded link (IMAGE)

					const embed = new EmbedBuilder()
						.setColor("Yellow")
						.setAuthor({
							name: msg.author.username,
							iconURL: msg.author.displayAvatarURL({ extension: "png", size: 2048 }),
							url: `https://discord.com/channels/${g_id}/${reaction.message.channel.id}/${reaction.message.id}`,
						})
						.addFields([{ name: `Source`, value: `[Jump](https://discord.com/channels/${g_id}/${reaction.message.channel.id}/${reaction.message.id})`, inline: true }])
						.setFooter({ text: `✨ Starred` })
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
				}
			} catch (e) {
				logger.error(`[ERROR] [message-spotlight] ${e}`);
			}
		});
	},
};

export default event;
