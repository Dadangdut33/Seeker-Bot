import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { malAnimeSearch, malMangaEmbed } from "../../../utils/commands/anime";
import { btnPrompter } from "../../../utils";
import malScraper from "mal-scraper";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("mal")
		.setDescription("Search an anime/manga from MyAnimeList")
		.addStringOption((option) =>
			option //
				.setName("type")
				.setDescription("Search Anime / Manga")
				.addChoices({ name: "Anime", value: "anime" }, { name: "Manga", value: "manga" })
				.setRequired(true)
		)
		.addStringOption((option) =>
			option //
				.setName("query")
				.setDescription("Search query")
				.setRequired(true)
		),

	execute: async (interaction) => {
		await interaction.deferReply();
		const type = interaction.options.getString("type"),
			query = interaction.options.getString("query")!;

		if (type == "anime") {
			interaction.editReply(`Searching for anime \`${query}\`...`);
			const qRes = await malAnimeSearch(query);
			if (!qRes) return interaction.editReply(`No result found for anime \`${query}\``);
			return interaction.editReply({ content: "", embeds: [qRes.embed], components: [qRes.component] });
		} else {
			interaction.editReply(`Searching for manga \`${query}\`...`);
			const qRes = await malScraper.search.search("manga", { term: query, maxResults: 5 });

			if (!qRes.length) return interaction.editReply(`No result found for manga \`${query}\``);

			// ask to choose which manga
			let options = [],
				limit = qRes.length >= 5 ? 5 : qRes.length;

			const btnsRow = new ActionRowBuilder<ButtonBuilder>();
			for (let i = 0; i < limit; i++) {
				options[i] = `${i + 1}. [${qRes[i].title}](${qRes[i].url})`;
				btnsRow.addComponents(
					new ButtonBuilder()
						.setCustomId(`mal-manga-${i}`)
						.setLabel(`${i + 1}`)
						.setStyle(ButtonStyle.Primary)
				);
			}

			const embedOption = new EmbedBuilder()
				.setColor("#2E51A2")
				.setAuthor({
					name: "Myanimelist.net",
					iconURL: "https://cdn.discordapp.com/attachments/799595012005822484/813811066110083072/MyAnimeList_Logo.png",
					url: "https://myanimelist.net/",
				})
				.setTitle(`Please Choose The Manga That You Are Searching For Below`)
				.setDescription(options.join("\n"));

			const msg = await interaction.editReply({ content: "", embeds: [embedOption], components: [btnsRow] });
			const promptResult = await btnPrompter(msg, interaction, 120);

			if (!promptResult)
				return interaction.editReply({
					components: [],
					content: "",
					embeds: [new EmbedBuilder().setColor("NotQuiteBlack").setDescription("**Manga search cancelled** user did not choose any of the manga listed")],
				});

			const choice = parseInt(promptResult.split("-")[2]);
			const res = malMangaEmbed(qRes[choice]);

			interaction.editReply({ content: "", embeds: [res.embed], components: [res.component] });
		}
	},
};

export default slashCommands;
