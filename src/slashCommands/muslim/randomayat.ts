import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { embedRandomAyat } from "../../utils/commands/verse";
import { logger } from "../../logger";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("randomayat").setDescription("Get random ayat from the Quran using quran.com and equran.id API"),
	execute: async (interaction) => {
		await interaction.deferReply();
		const data = await embedRandomAyat();
		if (!data) {
			await interaction.editReply({ content: "API Failed to respond on random ayat" });
			logger.error("API Failed to respond on random ayat");
			return;
		}

		// Surah number and ayat is in the title of the first embed with format like this [surah:number] xxx (xxx) - xxx
		// get each of it
		const surahNumber = data[0].data.title?.split(" ")[0].split(":")[0].replace("[", ""),
			ayatNumber = data[0].data.title?.split(" ")[0].split(":")[1].replace("]", "");

		// add button to get the tafsir
		const tafsirButton = new ButtonBuilder().setCustomId(`tafsir-${surahNumber}:${ayatNumber}`).setStyle(1).setLabel("Tafsir");
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(tafsirButton);

		interaction.editReply({ embeds: data, components: [row] });
	},
};

export default slashCommands;
