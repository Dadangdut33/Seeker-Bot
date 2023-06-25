import { Message, ChannelType } from "discord.js";
import mongoose from "mongoose";
import malScraper from "mal-scraper";
import { logger } from "../../logger";
import { find_colname, getGuildOption, insert_colname, updateOne_colname } from "../db";
import { capitalizeFirstLetter, hasEmoji, hasLink, hasNumber } from "../index";
import { detect, format } from "../locallib/detect-haiku/detect-haiku";
import { malAnimeSearch as malAnimeSearch, malMangaEmbed } from "../commands/anime";

export const crosspost = (message: Message) => {
	try {
		const { channel } = message;

		try {
			if (channel.type === ChannelType.GuildAnnouncement) {
				message.crosspost(); // crosspost automatically
				logger.debug(`News Published at ${new Date().toLocaleString()}`);
			}
		} catch (error) {
			logger.error(`Fail to publish news: ${error}`);
		}
	} catch (error) {
		logger.error(`[${new Date().toLocaleString()}] [ERROR] [Crosspost] | ${error}`);
	}
};

export const detectHaiku = async (message: Message) => {
	try {
		if (!message.guild) return; // must be in guild

		let prefix = process.env.PREFIX;
		if (mongoose.connection.readyState === 1) {
			let guildPrefix = await getGuildOption(message.client, message.guild, "prefix");
			if (guildPrefix) prefix = guildPrefix;
		}

		// rejected format
		if (
			message.content.startsWith(prefix) || // if message starts with prefix
			message.mentions.members!.first() || // if message mentions someone
			message.mentions.channels.first() || // if message mentions a channel
			hasNumber(message.content) || // if message contains number
			hasEmoji(message.content) || // if message contains emoji
			hasLink(message.content) || // if message contains link
			message.content.startsWith("||") ||
			message.content.endsWith("||") ||
			message.author.bot
		)
			return;

		// Make sure it's not a spoiler and not a bot
		if (detect(message.content)) {
			let haikuGet = format(message.content.replace(/(\n)/g, " "));
			if (haikuGet.length === 0) return;

			const { author, guild } = message;
			// find in db
			const checkExist = await find_colname("haiku", { author: author.id, guildID: guild?.id }); // guildID
			if (checkExist!.length === 0) insert_colname("haiku", { author: author.id, guildID: guild?.id, count: 1 });
			else updateOne_colname("haiku", { author: author.id, guildID: guild?.id }, { $set: { count: checkExist![0].count + 1 } });

			haikuGet.forEach((item, index) => {
				haikuGet[index] = capitalizeFirstLetter(item);
			});

			const rgb = Math.floor(Math.random() * 16777215);
			message.reply({
				embeds: [
					{
						author: {
							name: message.author.username,
							icon_url: message.author.displayAvatarURL({ size: 2048, extension: "png" }),
							url: "https://en.wikipedia.org/wiki/Haiku",
						},
						description: `*${haikuGet.join("\n\n").replace(/[\*\`\"]/g, "")}*`,
						footer: { text: `Haiku Detected, Sometimes successfully\nTotal Haiku(s) in this server: ${checkExist?.length === 0 ? 1 : checkExist![0].count + 1}` },
						color: rgb,
					},
				],
				allowedMentions: { repliedUser: false },
			});
		}
	} catch (error) {
		logger.error(`[ERROR] [DetectHaiku] | ${error}`);
	}
};

export const detectMangaSearch = async (message: Message, prefix: string) => {
	try {
		if (message.content.startsWith(prefix) || message.channel.type === ChannelType.DM) return;

		// regex for words surrounded by <<>>
		const regexMangaSearch = /<<(.*?)>>/g;

		if (!regexMangaSearch.test(message.content)) return;

		// check if there is any match
		const match = message.content.match(regexMangaSearch)!;
		const matches = match.map((m) => m.replace(/<<|>>/g, "").trim()); // store in matches

		// search manga
		for (let toSearch of matches) {
			if (toSearch === "") return;
			const msg = await message.channel.send(`Fetching data...`);
			const malSearcher = malScraper.search;

			try {
				const data = await malSearcher.search("manga", {
					maxResults: 5,
					term: toSearch, // search term
				});

				const manga = data[0];
				msg.delete();

				if (!manga) return message.channel.send(`No results found for ${toSearch}.`);

				const res = malMangaEmbed(manga);
				message.reply({ embeds: [res] });
			} catch (error) {
				logger.error(`[ERROR] [MangaSearch - Inside Search Loop] | ${error}`);
				msg.delete();
				message.channel.send(`Error searching **${toSearch}**!\nDetails: ${error}`);
			}
		}
	} catch (error) {
		logger.error(`[ERROR] [MangaSearch] | ${error}`);
	}
};

export const detectAnimeSearch = async (message: Message, prefix: string) => {
	try {
		if (message.content.startsWith(prefix) || message.channel.type === ChannelType.DM) return;

		// regex for words surrounded by {{}}. Ex: {{anime}}
		const regexAnimeSearch = /\{\{([^\{\}]*)\}\}/g;
		if (!regexAnimeSearch.test(message.content)) return;

		// check if there is a match
		// get the match
		const match = message.content.match(regexAnimeSearch)!;
		const matches = match.map((m) => m.replace(/\{\{|\}\}/g, "").trim()); // array of matches

		// search anime
		for (let toSearch of matches) {
			if (toSearch === "") return; // Must contain something

			const msg = await message.channel.send(`Fetching data...`);
			try {
				const data = await malAnimeSearch(toSearch);

				msg.delete();
				if (!data) return message.channel.send(`No results found for **${toSearch}**!`);

				message.reply({ embeds: [data.embed], components: [data.component] });
			} catch (error) {
				msg.delete();
				logger.error(`[ERROR] [AnimeSearch - Inside Search Loop] | ${error}`);
				message.channel.send(`Error fetching data for ${toSearch}.\nDetails: ${error}`);
			}
		}
	} catch (error) {
		logger.error(`[ERROR] [AnimeSearch] | ${error}`);
	}
};
