import Parser from "rss-parser";
import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";
import { find_colname, insert_colname, updateOne_colname } from "../../utils";
const parser = new Parser();

const run_nyaa = async (guildID: string, channel: TextChannel) => {
	const feed = await parser.parseURL("https://nyaa.si/?page=rss");

	// check if guild is registered in db
	const check = (await find_colname("nyaa", { guildID: guildID })) as { guildID: string; last_Nyaa: string }[];

	if (check.length === 0) {
		// if not, insert/register it and no need to slice the feed
		await insert_colname("nyaa", { guildID, last_Nyaa: feed.items[0].guid });
	} else {
		// cut feed from 0 to last found
		let limit = 15,
			index = -1,
			counter = 0;
		const last_Nyaa = check[0].last_Nyaa,
			splittedNyaa = last_Nyaa.split("/"),
			baseLink = splittedNyaa.slice(0, splittedNyaa.length - 1).join("/");

		// get index of last found
		// in a while loop because item can sometimes already removed from feed
		while (index === -1) {
			index = feed.items.findIndex((item) => item.guid === baseLink + "/" + `${parseInt(splittedNyaa[splittedNyaa.length - 1]) - counter}`);

			counter++;
			if (counter === limit) break;
		}

		// update db
		await updateOne_colname("nyaa", { guildID }, { $set: { last_Nyaa: feed.items[0].guid } });

		// if index is -1, then last found is not found in feed which means no cut
		// slice feed from 0 to last found
		if (index !== -1) feed.items = feed.items.slice(0, index);
	}

	feed.items.reverse(); // reverse it first so it will be in correct order
	if (feed.items.length === 0) return; // if feed is empty, then no new item and no need to send message

	let embedList = [];
	// iterate through feed and send rss info
	for (const item of feed.items) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: "Nyaa.si",
				url: "https://nyaa.si/",
				iconURL: "https://media.discordapp.net/attachments/799595012005822484/1002247072738705499/fH1dmIuo_400x400.jpg",
			})
			.setTitle(item.title ? item.title : "Title not found")
			.setURL(item.guid!)
			.setDescription(item.contentSnippet ? item.contentSnippet : "Contentsnippet not found")
			.addFields([
				{ name: "Download", value: `[Torrent](${item.link})`, inline: true },
				{
					name: "Published at",
					value: item.isoDate ? `<t:${new Date(item.isoDate).valueOf() / 1000}>` : item.pubDate ? item.pubDate : "Date published at not found",
					inline: true,
				},
			])
			.setColor("#0099ff")
			.setFooter({ text: `${feed.title}` })
			.setTimestamp();

		embedList.push(embed);

		if (embedList.length === 10) {
			// send every 10 embeds
			channel.send({ embeds: embedList });
			embedList = [];
		}
	}

	// send remaining embeds
	if (embedList.length > 0) {
		channel.send({ embeds: embedList });
	}
};

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `Module: Nyaa rss feed | Loading feed`,
	execute: async (client: Client) => {
		const guildID = process.env.PERSONAL_SERVER_ID!,
			channelID = process.env.PERSONAL_SERVER_NYAA_CHANNEL_ID!;

		if (!guildID || !channelID) return logger.warn("guild or channel ID not set!");

		const theGuild = client.guilds.cache.get(guildID);
		if (!theGuild) return logger.warn("Invalid guild for Nyaa rss feed");

		// get channel by id
		const theChannel = theGuild.channels.cache.get(channelID) as TextChannel;
		if (!theChannel) return logger.warn("Invalid channel for Nyaa rss feed");

		logger.debug(`Module: Nyaa rss feed | Guild: ${theGuild.name}`);
		// run nyaa on startup
		try {
			await run_nyaa(guildID, theChannel);
		} catch (e) {
			logger.error(`[ERROR] [nyaa] startup fail to run nyaa rss feed | ${e}`);
		}

		// interval every .5 hour
		setInterval(async () => {
			try {
				await run_nyaa(guildID, theChannel);
			} catch (e) {
				logger.error(`[ERROR] [nyaa]| ${e}`);
			}
		}, 60 * 1000 * 30); // 30 minutes
	},
};

export default event;
