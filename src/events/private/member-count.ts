import { Client, Guild } from "discord.js";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} Loaded | Now waiting for new members...`,
	execute: (client: Client) => {
		const guildID = process.env.PERSONAL_SERVER_ID!,
			channelID = process.env.PERSONAL_SERVER_MEMBER_COUNT_ID!;

		if (!guildID || !channelID) return logger.warn("guild or channel ID not set!");

		const theGuild = client.guilds.cache.get(guildID);
		if (!theGuild) return logger.warn("Invalid guild for member count");

		try {
			const theID = channelID;
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
