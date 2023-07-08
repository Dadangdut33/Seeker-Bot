import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { interactionBtnPaginator, toTitleCase } from "../../utils";
import { logger } from "../../logger";
import axios from "axios";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("urbandictionary")
		.setDescription("Find the definition of a term from Urban Dictionary")
		.addStringOption((option) => option.setName("search").setDescription("Search term").setRequired(true)),

	execute: async (interaction) => {
		await interaction.deferReply();
		const search = interaction.options.getString("search")!;

		const query = search.replace(/ /g, "%20"),
			url = "https://api.urbandictionary.com/v0/define?term=",
			thumbnail = "https://naeye.net/wp-content/uploads/2018/05/Urban-Dictionary-logo-475x300.png",
			link = url + query;

		try {
			logger.debug(`her0 ${link}`);
			const { data } = await axios.get(link);
			const dataList = data.list;

			let display: EmbedBuilder[] = [];
			dataList.forEach((el: any, i: number) => {
				const author = el.author,
					title = toTitleCase(el.word),
					meaning = el.definition,
					examples = el.example,
					description = [`${meaning}`, `\n**Examples:**\n${examples}`].join("\n");

				display[i] = new EmbedBuilder() //
					.setAuthor({ name: author, url: el.permalink })
					.setColor("Random")
					.setThumbnail(thumbnail)
					.setURL(link)
					.setDescription(description)
					.addFields([{ name: "Votes ", value: `👍 ${el.thumbs_up} / 👎 ${el.thumbs_down}`, inline: true }])
					.setTitle(title);
			});

			interactionBtnPaginator(interaction, display, 2);
		} catch (error) {
			logger.error(`${error}`);
			return interaction.editReply(`Error! Please try again later.\n\`\`\`${error}\`\`\``);
		}
	},
};

export default slashCommands;
