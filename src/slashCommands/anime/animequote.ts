import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import animeQuotes from "animequotes";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("animequote").setDescription("Get random anime quote"),

	execute: async (interaction) => {
		await interaction.deferReply();
		const dataGet = animeQuotes.randomQuote();
		if (!dataGet.success) return interaction.editReply("Error: Fail to get data");

		return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Random").setTitle(`${dataGet.quote}`).setDescription(`${dataGet.name} - ${dataGet.anime}`)] });
	},
};

export default slashCommands;
