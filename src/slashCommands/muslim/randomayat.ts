import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { embedRandomAyat } from "../../utils/verse";
import { logger } from "../../logger";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("randomayat").setDescription("Get random ayat from the Quran using quran.com and equran.id API"),
	execute: async (interaction) => {
		const data = await embedRandomAyat();
		if (!data) {
			interaction.reply({ content: "API Failed to respond on random ayat", ephemeral: true });
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

		interaction.reply({ embeds: data, components: [row] });
	},
};

export default slashCommands;
