import { Client, TextChannel } from "discord.js";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";
import { send_ann, send_crunchyroll, send_mal } from "../../utils/rss";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} rss feed | Loading myanimelist and crunchyroll feed`,
	execute: async (client: Client) => {
		const gid = process.env.PERSONAL_SERVER_ID!,
			mal_ch_id = process.env.PERSONAL_SERVER_MAL_CHANNEL_ID!,
			crunchyroll_ch_id = process.env.PERSONAL_SERVER_CRUNCHYROLL_CHANNEL_ID!,
			ann_ch_id = process.env.PERSONAL_SERVER_ANN_CHANNEL_ID!;

		if (!gid || !mal_ch_id || !crunchyroll_ch_id || !ann_ch_id) return logger.warn("guild or channel ID not set!");

		const theGuild = client.guilds.cache.get(gid);
		if (!theGuild) return logger.warn("Invalid guild for anime rss feed");

		// get channel by id
		const mal_ch = theGuild.channels.cache.get(mal_ch_id) as TextChannel;
		if (!mal_ch) return logger.warn("Invalid channel for mal rss feed");

		const crunchyroll_ch = theGuild.channels.cache.get(crunchyroll_ch_id) as TextChannel;
		if (!crunchyroll_ch) return logger.warn("Invalid channel for crunchyroll rss feed");

		const ann_ch = theGuild.channels.cache.get(ann_ch_id) as TextChannel;
		if (!ann_ch) return logger.warn("Invalid channel for ann rss feed");

		logger.debug(`Sending anime news... | Guild: ${theGuild.name}`);
		const send = async () => {
			try {
				await send_mal(gid, "myanimelist", "https://myanimelist.net/rss/news.xml", mal_ch);
				// http://feeds.feedburner.com/crunchyroll/ -> only episodes data?
				// https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss
				await send_crunchyroll(gid, "crunchyroll", "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss", crunchyroll_ch);
				await send_ann(gid, "ann", "https://www.animenewsnetwork.com/all/rss.xml?ann-edition=sea", ann_ch);
			} catch (e) {
				logger.error(`[ERROR] fail to run anime news feed | ${e}`);
			}
		};

		// run on startup
		await send();
		setInterval(async () => {
			await send();
		}, 60 * 1000 * 20); // 20 minutes
	},
};

export default event;
