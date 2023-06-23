import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { getAdvice } from "../../utils/commands";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("advice").setDescription("Gives you random advice"),

	execute: async (interaction) => {
		await interaction.deferReply();
		let data = await getAdvice();

		if (!data) {
			await interaction.editReply({ content: `Can't reached API, try again later!` });
			return;
		}

		await interaction.editReply({ content: "", embeds: [new EmbedBuilder().setDescription(data).setColor("Random")] });
	},
};

export default slashCommands;
