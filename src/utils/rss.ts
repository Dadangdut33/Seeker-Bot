import { EmbedBuilder, TextChannel } from "discord.js";
import Parser from "rss-parser";
import { find_colname, insert_colname, updateOne_colname } from "./db";
const parser = new Parser();

export const run_rss = async (gid: string, type: string, feedurl: string) => {
	const feed = await parser.parseURL(feedurl);

	// check if guild is registered in db
	const check = (await find_colname("rssfeeds", { gid: gid, type: type })) as { gid: string; last_feed: string }[];

	if (check.length === 0) {
		// if not, insert/register it and no need to slice the feed
		await insert_colname("rssfeeds", { gid, last_feed: feed.items[0].guid, type: type });
	} else {
		// cut feed from 0 to last found
		let limit = 15,
			index = -1,
			counter = 0;
		const last_feed = check[0].last_feed,
			splitted = last_feed.split("/"),
			baseLink = splitted.slice(0, splitted.length - 1).join("/");

		// get index of last found
		// in a while loop because item can sometimes already removed from feed
		while (index === -1) {
			index = feed.items.findIndex((item) => item.guid === baseLink + "/" + `${parseInt(splitted[splitted.length - 1]) - counter}`);

			counter++;
			if (counter === limit) break;
		}

		// update db
		await updateOne_colname("rssfeeds", { gid }, { $set: { last_feed: feed.items[0].guid } });

		// if index is -1, then last found is not found in feed which means no cut
		// slice feed from 0 to last found
		if (index !== -1) feed.items = feed.items.slice(0, index);
	}

	feed.items.reverse(); // reverse it first so it will be in correct order
	if (feed.items.length === 0) return; // if feed is empty, then no new item and no need to send message

	return feed;
};

export const send_mal = async (gid: string, type: string, feedurl: string, channel: TextChannel) => {
	const feed = await run_rss(gid, type, feedurl);
	if (!feed) return; // if feed is empty, then no new item and no need to send message

	let embedList = [];
	// iterate through feed and send rss info
	for (const item of feed.items) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: "Myanimelist.net",
				url: "https://Myanimelist.net/",
				iconURL: "https://media.discordapp.net/attachments/799595012005822484/813811066110083072/MyAnimeList_Logo.png",
			})
			.setTitle(item.title ? item.title : "Title not found")
			.setDescription(
				item.contentSnippet ? (item.contentSnippet.length > 500 ? item.contentSnippet.slice(0, 500) + "..." : item.contentSnippet) : "Contentsnippet not found"
			)
			.addFields([
				{ name: "Author", value: `MAL User`, inline: true },
				{
					name: "Published at",
					value: item.isoDate ? `<t:${new Date(item.isoDate).valueOf() / 1000}>` : item.pubDate ? item.pubDate : "Date published at not found",
					inline: true,
				},
			])
			.setColor("#2f51a3")
			.setFooter({ text: `${feed.title}` })
			.setTimestamp();

		if (item.guid) embed.setURL(item.guid);

		embedList.push(embed);

		if (embedList.length === 5) {
			// send every 5 embeds
			channel.send({ embeds: embedList });
			embedList = [];
		}
	}

	// send remaining embeds
	if (embedList.length > 0) {
		channel.send({ embeds: embedList });
	}
};

export const send_crunchyroll = async (gid: string, type: string, feedurl: string, channel: TextChannel) => {
	const feed = await run_rss(gid, type, feedurl);
	if (!feed) return; // if feed is empty, then no new item and no need to send message

	let embedList = [];
	// iterate through feed and send rss info
	for (const item of feed.items) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: "Crunchyroll.com/News",
				url: "https://Crunchyroll.com/news",
				iconURL: "https://cdn.discordapp.com/attachments/653206818759376916/798413724062842880/857px-Crunchyroll_Logo.jpg",
			})
			.setTitle(item.title ? item.title : "Title not found")
			.setDescription(
				item.contentSnippet ? (item.contentSnippet.length > 500 ? item.contentSnippet.slice(0, 500) + "..." : item.contentSnippet) : "Contentsnippet not found"
			)
			.addFields([
				{ name: "Author", value: item.creator ? item.creator : "Author not found", inline: true },
				{
					name: "Published at",
					value: item.isoDate ? `<t:${new Date(item.isoDate).valueOf() / 1000}>` : item.pubDate ? item.pubDate : "Date published at not found",
					inline: true,
				},
			])
			.setColor("#f78a26")
			.setFooter({ text: `${feed.title}` })
			.setTimestamp();

		if (item.guid) embed.setURL(item.guid);

		embedList.push(embed);

		if (embedList.length === 5) {
			// send every 5 embeds
			channel.send({ embeds: embedList });
			embedList = [];
		}
	}

	// send remaining embeds
	if (embedList.length > 0) {
		channel.send({ embeds: embedList });
	}
};

export const send_nyaa = async (gid: string, type: string, feedurl: string, channel: TextChannel) => {
	const feed = await run_rss(gid, type, feedurl);
	if (!feed) return; // if feed is empty, then no new item and no need to send message

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

		if (item.guid) embed.setURL(item.guid);

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
