import { SlashCommandBuilder } from "discord.js";
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

		// add button to get the tafsir
		const tafsirButton = {
			type: 2,
			style: 1,
			label: "Tafsir",
			custom_id: "tafsir",
		};

		const row = {
			type: 1,
			components: [tafsirButton],
		};

		interaction.reply({ embeds: data, components: [row] });
	},
};

export default slashCommands;
