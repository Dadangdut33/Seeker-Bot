import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { embedSurah } from "../../utils/commands/verse";
import { logger } from "../../logger";
import { embedInteractionWithBtnPaginator } from "../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("surah")
		.setDescription("Read a surah from the Quran using quran.com and equran.id API")
		.addIntegerOption((option) => option.setName("surah").setDescription("Surah number").setRequired(true).setMinValue(1).setMaxValue(114))
		.addIntegerOption((option) => option.setName("start-ayat").setDescription("Starting ayat").setRequired(false).setMinValue(1))
		.addIntegerOption((option) => option.setName("end-ayat").setDescription("Ending ayat").setRequired(false).setMinValue(1)),

	execute: async (interaction) => {
		const surah = interaction.options.getInteger("surah", true);
		const startAyat = interaction.options.getInteger("start-ayat", false);
		const endAyat = interaction.options.getInteger("end-ayat", false);

		await interaction.deferReply();
		const data = await embedSurah(surah, startAyat, endAyat);
		if (!data) {
			await interaction.editReply({ content: "API Failed to respond on getting surah" });
			logger.error("API Failed to respond on getting surah");
			return;
		}

		const component_func = (index: number) => {
			// ayat is located in the title of the embed with format like this Ayat ke-xxx
			console.log(data[index].toJSON());

			const ayat = data[index].toJSON().title?.split(" ")[2].replace("-", "");
			const tafsirButton = new ButtonBuilder().setCustomId(`tafsir-${surah}:${ayat}`).setStyle(1).setLabel("Tafsir");
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(tafsirButton);
			return row;
		};

		await interaction.editReply({ embeds: [data[0]] });
		// remove the first embed because it's the surah info
		embedInteractionWithBtnPaginator(interaction, data.slice(1), 60, { components_function: component_func }); // 60 minutes
	},
};

export default slashCommands;
