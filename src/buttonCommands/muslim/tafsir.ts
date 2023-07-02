import { logger } from "../../logger";
import { IButtonCommand } from "../../types";
import { embedTafsir } from "../../utils/commands/verse";

const command: IButtonCommand = {
	id: "tafsir",
	execute: async (interaction, args: string) => {
		logger.debug(`args: ${args}`);

		const surah = args.split(":")[0],
			ayat = args.split(":")[1],
			tafsirGet = await embedTafsir(parseInt(surah), parseInt(ayat), true);

		if (!tafsirGet) return interaction.reply({ content: "API Failed to respond on tafsir", ephemeral: true });

		interaction.reply({ embeds: tafsirGet, ephemeral: true });
	},
};

export default command;
