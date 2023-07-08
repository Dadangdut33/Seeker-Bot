import { logger } from "../../logger";
import { IButtonCommand } from "../../types";
import { interactionBtnMultiEmbedPaginator } from "../../utils/helper";
import { embedTafsir } from "../../utils/commands/verse";

const command: IButtonCommand = {
	id: "tafsir",
	execute: async (interaction, args: string) => {
		await interaction.deferReply({ ephemeral: true });
		try {
			const surah = args.split(":")[0],
				ayat = args.split(":")[1],
				tafsirGet = await embedTafsir(parseInt(surah), parseInt(ayat), true);

			if (!tafsirGet) return interaction.editReply({ content: "API Failed to respond on tafsir" });

			interactionBtnMultiEmbedPaginator(interaction as any, tafsirGet, 3, 60);
		} catch (error) {
			logger.error(`${error}`);
			await interaction.editReply({ content: `Failed to execute the command. Got error: \`\`\`${error}\`\`\`` });
		}
	},
};

export default command;
