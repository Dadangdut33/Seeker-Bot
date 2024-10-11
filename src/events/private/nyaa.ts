import { Client, TextChannel } from "discord.js";
import { IBotEvent } from "@/types";
import { logger } from "@/logger";
import { send_nyaa } from "@/utils/rss";
import { CronJob } from "cron";
import { env } from "@/env";

const event: IBotEvent = {
	name: "ready",
	once: true,
	disabled: true,
	loadMsg: `👀 Module: ${__filename} rss feed | Loading feed`,
	execute: async (client: Client) => {
		const gid = env.PERSONAL_SERVER_ID!,
			channelID = env.PERSONAL_SERVER_NYAA_CHANNEL_ID!;

		if (!gid || !channelID) return logger.warn("guild or channel ID not set!");

		const theGuild = client.guilds.cache.get(gid);
		if (!theGuild) return logger.warn("Invalid guild for Nyaa rss feed");

		// get channel by id
		const theChannel = theGuild.channels.cache.get(channelID) as TextChannel;
		if (!theChannel) return logger.warn("Invalid channel for Nyaa rss feed");

		logger.debug(`Module: Nyaa rss feed | Guild: ${theGuild.name}`);
		const send = async () => {
			try {
				await send_nyaa(gid, "https://nyaa.si/?page=rss", theChannel);
			} catch (e) {
				logger.error(`[ERROR] [nyaa] startup fail to run nyaa rss feed | ${e}`);
			}
		};

		// run on startup
		await send();
		const cron = new CronJob("*/30 * * * *", async () => await send(), null, true, "Asia/Jakarta");
		cron.start();
	},
};

export default event;
