import { Client, Guild } from "discord.js";
import { IBotEvent } from "@/types";
import { logger } from "@/logger";
import { env } from "@/env";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} Loaded | Now waiting for new members...`,
	execute: (client: Client) => {
		const g_id = env.PERSONAL_SERVER_ID!,
			ch_id = env.PERSONAL_SERVER_MEMBER_COUNT_ID!;

		if (!g_id || !ch_id) return logger.warn("guild or channel ID not set!");

		const theGuild = client.guilds.cache.get(g_id);
		if (!theGuild) return logger.warn("Invalid guild for member count");

		try {
			const theID = ch_id;
			const updateMembers = (guild: Guild) => {
				const theChannel = guild.channels.cache.get(theID);
				if (theChannel) theChannel.setName(`Total Members: ${guild.memberCount}`);
				else logger.warn("Invalid channel ID for member count");
			};

			client.on("guildMemberAdd", (member) => {
				if (member.guild === theGuild) updateMembers(member.guild);
			});
			client.on("guildMemberRemove", (member) => {
				if (member.guild === theGuild) updateMembers(member.guild);
			});

			updateMembers(theGuild);
		} catch (e) {
			logger.error(`[ERROR] [member-count] | [${e}`);
		}
	},
};

export default event;
