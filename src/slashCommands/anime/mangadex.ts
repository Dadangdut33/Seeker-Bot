import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { ISlashCommand } from "../../types";
import { btnPrompter, convertToEpoch, interactionBtnPaginator } from "../../utils";
import { logger } from "../../logger";
import { Manga, login, resolveArray } from "mangadex-full-api";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("mangadex")
		.setDescription("Mangadex reader. Search manga, get chapter list, and read chapter")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("list-chapter")
				.setDescription("Get chapter list")
				.addStringOption((option) => option.setName("query").setDescription("Manga title").setRequired(true))
				.addBooleanOption((option) => option.setName("english-only").setDescription("English result only? (Default true)").setRequired(false))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("read-chapter")
				.setDescription("Read chapter, must use the chapter number from list-chapter")
				.addStringOption((option) => option.setName("query").setDescription("Manga title").setRequired(true))
				.addIntegerOption((option) => option.setName("chapter").setDescription("Chapter number").setRequired(true).setMinValue(0))
				.addBooleanOption((option) =>
					option
						.setName("english-only")
						.setDescription(
							"English result only? (Default true). Set it to false if you want to input the chapter number that you get from list-chapter when you search with english-only also set to false"
						)
						.setRequired(false)
				)
				.addBooleanOption((option) =>
					option.setName("raw").setDescription("Send the results as plain image instead of as embed reader (Default false)").setRequired(false)
				)
		),

	execute: async (interaction) => {
		try {
			const command = interaction.options.getSubcommand();
			const query = interaction.options.getString("query", true);

			const username = process.env.Mangadex_Username!;
			const password = process.env.Mangadex_Password!;
			await interaction.deferReply();
			await login(username, password);

			if (command === "list-chapter") {
				const mangaList = await Manga.search(query);
				const englishOnly = interaction.options.getBoolean("english-only", false) ?? true;

				// if manga is not found, return
				if (!mangaList.length) return interaction.editReply({ content: `No result found for query \`${query}\`` });

				/// ask to choose which manga
				let options = [],
					limit = mangaList.length >= 5 ? 5 : mangaList.length;

				const btnsRow = new ActionRowBuilder<ButtonBuilder>();
				for (let i = 0; i < limit; i++) {
					options[i] = `${i + 1}. ${mangaList[i].title}`;
					btnsRow.addComponents(
						new ButtonBuilder()
							.setCustomId(`md-search-${i}`)
							.setLabel(`${i + 1}`)
							.setStyle(ButtonStyle.Primary)
					);
				}

				const embedOption = new EmbedBuilder()
					.setColor("#2E51A2")
					.setAuthor({
						name: "Mangadex.org",
						iconURL: "https://media.discordapp.net/attachments/799595012005822484/936142797994590288/xbt_jW78_400x400.png",
						url: "https://mangadex.org/",
					})
					.setTitle(`Please Choose The Manga That You Are Searching For Below`)
					.setDescription(options.join("\n"));

				const msg = await interaction.editReply({ content: "", embeds: [embedOption], components: [btnsRow] });
				const promptResult = await btnPrompter(msg, interaction, 120);

				if (!promptResult) return interaction.editReply({ content: `**Manga search cancelled** user did not choose any manga listed`, embeds: [], components: [] });

				const choice = parseInt(promptResult.split("-")[2]);
				const chosen = mangaList[choice];
				await interaction.editReply({ content: `Retrieving chapter lists **please wait...**`, embeds: [], components: [btnsRow] });

				// manga info
				let id = chosen.id,
					originLang = chosen.originalLanguage,
					title = chosen.title,
					cover = (await chosen.mainCover.resolve()).imageSource,
					artist = (await resolveArray(chosen.artists)).map((artist) => artist.name).join(", "),
					author = (await resolveArray(chosen.authors)).map((author) => author.name).join(", "),
					volume = chosen.lastVolume,
					chapterTotal = chosen.lastChapter,
					lastUpdate = chosen.updatedAt,
					link = `https://mangadex.org/title/${id}`;

				// Get the manga's chapters:
				let chapters = await chosen.getFeed(
					{ order: { chapter: "asc", volume: "asc", createdAt: "asc", updatedAt: "asc", publishAt: "asc" }, translatedLanguage: englishOnly ? ["en"] : [] },
					true
				);

				if (chapters.length == 0) return interaction.editReply({ content: `No chapter found for \`${title}\``, embeds: [], components: [] });

				// get the chapter
				const perEmbed = 20;
				let loop = Math.ceil(chapters.length / perEmbed), // get how many loop, limit chapters shown to 20 per embed
					embedChapterLists = [];

				// verify total chapter and volume
				chapterTotal = chapterTotal ? chapterTotal : chapters[chapters.length - 1].chapter;
				volume = volume ? volume : chapters[chapters.length - 1].volume;

				for (let i = 0; i < loop; i++) {
					embedChapterLists[i] = new EmbedBuilder()
						.setColor("#e6613e")
						.setAuthor({
							name: `${title} - ${chapterTotal} Chapter ${volume ? `(${volume} Volume)` : ``} | ${originLang} ${englishOnly ? "- en" : "- all"}`,
							iconURL: `https://media.discordapp.net/attachments/799595012005822484/936142797994590288/xbt_jW78_400x400.png`,
							url: link,
						})
						.setThumbnail(cover)
						.setDescription(
							chapters
								.map((chapter, index) => `**${index + 1}**. Ch ${chapter.chapter} ${chapter.title ? `- ${chapter.title}` : ``} [${chapter.translatedLanguage}]`)
								.slice(i * perEmbed, (i + 1) * perEmbed)
								.join("\n")
						)
						.addFields([
							{ name: "Artist", value: artist, inline: true },
							{ name: "Author", value: author, inline: true },
							{ name: "Last update", value: `<t:${convertToEpoch(lastUpdate)}>`, inline: true },
							{ name: "Link", value: `[Mangadex](${link}) | [MAL](https://myanimelist.net/manga.php?q=${title.replace(/ /g, "%20")}&cat=manga)`, inline: true },
						])
						.setFooter({ text: ` | Via Mangadex.org - Use the bold number for input to read the chapter` });
				}

				// send the embed in paginator
				interactionBtnPaginator(interaction, embedChapterLists, 10);
			} else if (command === "read-chapter") {
				const chapter = interaction.options.getInteger("chapter", true);
				const englishOnly = interaction.options.getBoolean("english-only", false) ?? true;
				const raw = interaction.options.getBoolean("raw", false);

				const startMsg = await interaction.editReply({ content: `Retrieving chapter **please wait...**` });
				const manga = await Manga.getByQuery(query);

				if (!manga) return interaction.editReply({ content: `No result found for query \`${query}\`` });

				// manga info
				let id = manga.id,
					originLang = manga.originalLanguage,
					title = manga.title,
					cover = (await manga.mainCover.resolve()).imageSource,
					artist = (await resolveArray(manga.artists)).map((artist) => artist.name).join(", "),
					author = (await resolveArray(manga.authors)).map((author) => author.name).join(", "),
					link = `https://mangadex.org/title/${id}`,
					// Get the manga's chapters:
					chapters = await manga.getFeed(
						{ order: { chapter: "asc", volume: "asc", createdAt: "asc", updatedAt: "asc", publishAt: "asc" }, translatedLanguage: englishOnly ? ["en"] : [] },
						true
					);

				if (chapters.length == 0) return interaction.editReply({ content: `No chapter found for \`${title}\`` });
				if (chapter > chapters.length)
					// verify that search chapter is not out of bound
					return interaction.editReply({
						content: `Chapter \`${chapter}\` not found for \`${title}\` | Details: \`Index Out of bound! Check for the correct index by using the \`list-chapter\` command\``,
					});

				// Get the chapter's pages:
				let chGet = chapters[chapter - 1],
					pages = await chGet.getReadablePages();

				await interaction.editReply(`Found manga titled: \`${manga.title}\`\n\nRetrieving ${pages.length} pages from chapter ${chapter} **please wait...**`);

				// Get uploader and grup names
				let uploader = await chGet.uploader.resolve(),
					groupNames = (await resolveArray(chGet.groups)).map((elem) => elem.name).join(", "),
					embedChaptersReader = [];

				if (!raw) {
					for (let i = 0; i < pages.length; i++) {
						embedChaptersReader[i] = new EmbedBuilder()
							.setColor("#e6613e")
							.setAuthor({
								name: `${title} - Chapter ${chGet.chapter} | ${originLang} - ${chGet.translatedLanguage}`,
								iconURL: `https://media.discordapp.net/attachments/799595012005822484/936142797994590288/xbt_jW78_400x400.png`,
								url: `https://mangadex.org/chapter/${chGet.id}/`,
							})
							.setImage(pages[i])
							.setThumbnail(cover)
							.setDescription(`[Click to look at the manga page on Mangadex](${link})\n**Manga Information**`)
							.addFields([
								{ name: "Artist", value: artist, inline: true },
								{ name: "Author", value: author, inline: true },
								{ name: "Chapter", value: `${chGet.chapter} ${chGet.title ? `- ${chGet.title}` : ``}`, inline: true },
								{ name: "Uploaded At", value: `<t:${convertToEpoch(chGet.publishAt)}>`, inline: true },
								{ name: "Raw", value: `[Click here](${pages[i]})`, inline: true },
								{ name: "Search on", value: `[MAL](https://myanimelist.net/manga.php?q=${title.replace(/ /g, "%20")}&cat=manga)`, inline: true },
							])
							.setFooter({ text: ` | Uploaded by ${uploader.username} | Scanlated by ${groupNames}` });
					}

					// send the embed in paginator
					interactionBtnPaginator(interaction, embedChaptersReader, 25); // 25 minutes timeout
				} else {
					// raw
					let embed = new EmbedBuilder()
						.setColor("#e6613e")
						.setAuthor({
							name: `${title} - Chapter ${chGet.chapter} | ${originLang} - ${chGet.translatedLanguage}`,
							iconURL: `https://media.discordapp.net/attachments/799595012005822484/936142797994590288/xbt_jW78_400x400.png`,
							url: `https://mangadex.org/chapter/${chGet.id}/`,
						})
						.setThumbnail(cover)
						.setDescription(`[Click to look at the manga page on Mangadex](${link})\n**Manga Information**`)
						.addFields([
							{ name: "Artist", value: artist, inline: true },
							{ name: "Author", value: author, inline: true },
							{ name: "Chapter", value: `${chGet.chapter} ${chGet.title ? `- ${chGet.title}` : ``}`, inline: true },
							{ name: "Uploaded At", value: `<t:${convertToEpoch(chGet.publishAt)}>`, inline: true },
							{ name: "Search on", value: `[MAL](https://myanimelist.net/manga.php?q=${title.replace(/ /g, "%20")}&cat=manga)`, inline: true },
						])
						.setFooter({ text: `RAW Mode | Uploaded by ${uploader.username} | Scanlated by ${groupNames}` });

					interaction.editReply({ content: ``, embeds: [embed] });

					// send raw
					// max image in 1 message is 10, so get how much loop first
					const channel = interaction.channel as TextChannel;

					let loop = Math.ceil(pages.length / 10);
					for (let i = 0; i < loop; i++) {
						await channel.send({ files: pages.slice(i * 10, (i + 1) * 10) });
					}

					channel.send({
						embeds: [
							new EmbedBuilder()
								.setColor("#e6613e")
								.setDescription(`[Click Here To Go To Top](https://discordapp.com/channels/${interaction.guildId!}/${interaction.channelId}/${startMsg.id})`),
						],
					});
				}

				// check for any offset
				if (chapter !== parseInt(chGet.chapter))
					interaction.followUp({
						embeds: [
							new EmbedBuilder()
								.setColor("#e6613e")
								.setTitle("Offset Detected!")
								.setDescription(
									`There seems to be an offset of ${
										chapter - parseInt(chGet.chapter)
									} chapter(s), between the searched chapter and the result received from the API.\n**Please use the \`list-chapter\` command to get chapter lists if you think the query is wrong to read the correct chapter**`
								),
						],
						ephemeral: true,
					});
			}
		} catch (error) {
			logger.error(`${error}`);
			interaction.editReply({ content: `An error occured while processing the command! Details: \`${error}\`` });
		}
	},
};

export default slashCommands;
