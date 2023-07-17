import { Client, TextChannel } from "discord.js";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";
import { send_nyaa } from "../../utils/rss";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} rss feed | Loading feed`,
	execute: async (client: Client) => {
		const gid = process.env.PERSONAL_SERVER_ID!,
			channelID = process.env.PERSONAL_SERVER_NYAA_CHANNEL_ID!;

		if (!gid || !channelID) return logger.warn("guild or channel ID not set!");

		const theGuild = client.guilds.cache.get(gid);
		if (!theGuild) return logger.warn("Invalid guild for Nyaa rss feed");

		// get channel by id
		const theChannel = theGuild.channels.cache.get(channelID) as TextChannel;
		if (!theChannel) return logger.warn("Invalid channel for Nyaa rss feed");

		logger.debug(`Module: Nyaa rss feed | Guild: ${theGuild.name}`);
		const send = async () => {
			try {
				await send_nyaa(gid, "nyaa", "https://nyaa.si/?page=rss", theChannel);
			} catch (e) {
				logger.error(`[ERROR] [nyaa] startup fail to run nyaa rss feed | ${e}`);
			}
		};

		// run on startup
		await send();
		setInterval(async () => {
			await send();
		}, 60 * 1000 * 15); // 30 minutes
	},
};

export default event;
