import { Message, ChannelType, EmbedBuilder } from "discord.js";
import mongoose from "mongoose";
import malScraper, { AnimeEpisodesDataModel } from "mal-scraper";
import { logger } from "../../logger";
import { find_colname, getGuildOption, insert_colname, updateOne_colname } from "../db";
import { capitalizeFirstLetter, hasEmoji, hasLink, hasNumber } from "../index";
import { detect, format } from "../locallib/detect-haiku/detect-haiku";

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

export const checkIfStaff = (toBeCheck: string) => {
	return ["Director", "Original Creator", "Producer", "Music", "Sound Director", "Series Composition"].includes(toBeCheck);
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

			malSearcher
				.search("manga", {
					maxResults: 5, // not working for some reason
					term: toSearch, // search term
				})
				.then(async (data) => {
					const manga = data[0];

					if (!manga) {
						msg.delete();
						return message.channel.send(`No results found for ${toSearch}.`);
					}

					const embed = new EmbedBuilder()
						.setColor("#2E51A2")
						.setAuthor({ name: `${manga.title} | ${manga.type}`, iconURL: manga.thumbnail, url: manga.url })
						.setDescription(manga.shortDescription ? manga.shortDescription : "-")
						.addFields([
							{
								name: `Type`,
								value: `${manga.type ?? "-"}`,
								inline: true,
							},
							{
								name: `Volumes`,
								value: `${manga.vols ?? "-"}`,
								inline: true,
							},
							{
								name: `Chapters`,
								value: `${manga.nbChapters ?? "-"}`,
								inline: true,
							},
							{
								name: `Scores`,
								value: `${manga.score ?? "-"}`,
								inline: true,
							},
							{
								name: `Start - End Date`,
								value: `${manga.startDate ? manga.startDate : "N/A"} - ${manga.endDate ? manga.endDate : "N/A"}`,
								inline: true,
							},
							{
								name: `Members`,
								value: `${manga.members ?? "-"}`,
								inline: true,
							},
							{
								name: "❯\u2000Search Online",
								// prettier-ignore
								value: `•\u2000\[Mangadex](https://mangadex.org/titles?q=${manga.title.replace(/ /g, "+")})`,
								inline: true,
							},
							{
								name: "❯\u2000PV",
								value: `${manga.video ? `[Click Here](${manga.video})` : "No PV available"}`,
								inline: true,
							},
							{
								name: "❯\u2000MAL Link",
								value: `•\u2000\[Click Title or Here](${manga.url})`,
								inline: true,
							},
						])
						.setFooter({ text: `Data Fetched From Myanimelist.net` })
						.setTimestamp()
						.setThumbnail(manga.thumbnail);

					msg.delete();
					message.reply({ embeds: [embed] });
				})
				.catch((error) => {
					logger.error(`[ERROR] [MangaSearch - Inside Search Loop] | ${error}`);
					msg.delete();
					message.channel.send(`Error searching **${toSearch}**!\nDetails: ${error}`);
				});
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
				const data = await malScraper.getInfoFromName(toSearch);

				if (!data) {
					msg.delete();
					return message.channel.send(`No results found for **${toSearch}**!`);
				}

				// -----------------------------
				// get chars and staff
				let animeChar: string[] = [],
					animeStaff: string[] = [];

				if (!data.staff || data.staff.length === 0) animeStaff = [`No staff for this anime have been added to this title.`];
				else data.staff.forEach((staff) => animeStaff.push(`• ${staff.name} - ${staff.role ? staff.role : "-"}`));

				if (!data.characters || data.characters.length === 0) animeChar = [`No characters for this anime have been added to this title.`];
				else data.characters.forEach((char) => animeChar.push(`• ${char.name} (${char.role}) VA: ${char.seiyuu.name ? char.seiyuu.name : "-"}`));

				// Sometimes the char is the staff so if the first array of each is the same
				if (data.characters && data.characters[0] && data.staff && data.staff[0]) {
					// No Staff, sometimes the role is character's role
					if (data.characters[0].name === data.staff[0].name && (data.staff[0].role === "Main" || data.staff![0].role === "Supporting") && animeStaff.length === 1)
						animeStaff = [`No staff for this anime have been added to this title.`];

					// No Character, sometimes the staff is the char
					if (data.characters[0].name === data.staff[0].name && checkIfStaff(data.staff[0].role!) && animeChar.length === 1)
						animeChar = [`No characters or voice actors have been added to this title.`];
				}

				// -----------------------------
				msg.delete();

				let embed = new EmbedBuilder()
					.setColor("#2E51A2")
					.setAuthor({
						name: `${data.englishTitle ? data.englishTitle : data.title} | ${data.type ? data.type : "N/A"}`,
						iconURL: data.picture,
						url: data.url,
					})
					.setDescription(data.synopsis ? data.synopsis : "No synopsis available.")
					.setFields([
						{
							name: "Japanese Name",
							value: `${(data as AnimeEpisodesDataModel).japaneseTitle ? `${(data as AnimeEpisodesDataModel).japaneseTitle} (${data.title})` : data.title}`,
							inline: false,
						},
						{
							name: "Synonyms",
							value: `${data.synonyms[0] === "" ? "N/A" : data.synonyms.join(" ")}`,
							inline: false,
						},
						{
							name: "Genres",
							value: `${data.genres ? (data.genres![0].length > 0 ? data.genres.join(", ") : "N/A") : "N/A"}`,
							inline: false,
						},
						{
							name: "Age Rating",
							value: `${data.rating ? data.rating : "N/A"}`,
							inline: true,
						},
						{
							name: "Source",
							value: `${data.source ? data.source : "N/A"}`,
							inline: true,
						},
						{
							name: "Status",
							value: `${data.status ? data.status : "N/A"}`,
							inline: true,
						},
						{
							name: `User Count/Favorite`,
							value: `${data.members ? data.members : "N/A"}/${data.favorites ? data.favorites : "N/A"}`,
							inline: true,
						},
						{
							name: "Average Score",
							value: `${data.score ? data.score : "N/A"} (${data.scoreStats ? data.scoreStats : "N/A"})`,
							inline: true,
						},
						{
							name: "Rating Rank/Popularity Rank`",
							value: `${data.ranked ? data.ranked : "N/A"}/${data.popularity ? data.popularity : "N/A"}`,
							inline: true,
						},
						{
							name: "Episodes/Duration",
							value: `${data.episodes ? data.episodes : "N/A"}/${data.duration ? data.duration : "N/A"}`,
							inline: true,
						},
						{
							name: "Broadcast Date",
							value: `${data.aired ? data.aired : "N/A"}`,
							inline: true,
						},
						{
							name: "Studios",
							value: `${data.studios!.length > 0 ? data.studios!.join(", ") : "N/A"}`,
							inline: true,
						},
						{
							name: "Producers",
							value: `${data.producers!.length > 0 ? data.producers!.join(", ") : "N/A"}`,
							inline: true,
						},
						{
							name: "Staff",
							value: `${animeStaff.join("\n")}`,
							inline: false,
						},
						{
							name: "Characters",
							value: `${animeChar.join("\n")}`,
							inline: false,
						},
						{
							name: "❯\u2000Search Online",
							// prettier-ignore
							value: `•\u2000\[9Anime](https://9anime.to/filter?keyword=${data.title.replace(/ /g, "+")})\n•\u2000\[Zoro](https://zoro.to/search?keyword=${data.title.replace(/ /g,"+")})\n•\u2000\[Nyaa](https://nyaa.si/?f=0&c=0_0&q=${data.title.replace(/ /g,"+")})`,
							inline: true,
						},
						{
							name: "❯\u2000PV",
							value: `${data.trailer ? `•\u2000\[Click Here!](${data.trailer})` : "No PV available."}`,
							inline: true,
						},
						{
							name: "❯\u2000MAL Link",
							value: `•\u2000\[Click Title or Here](${data.url})`,
							inline: true,
						},
					])
					.setFooter({ text: `Via Myanimelist.net` })
					.setTimestamp()
					.setThumbnail(data.picture ? data.picture : ``);

				message.reply({ embeds: [embed] });
			} catch (error) {
				logger.error(`[ERROR] [AnimeSearch - Inside Search Loop] | ${error}`);
				msg.delete();
				message.channel.send(`Error fetching data for ${toSearch}.\nDetails: ${error}`);
			}
		}
	} catch (error) {
		logger.error(`[ERROR] [AnimeSearch] | ${error}`);
	}
};
