import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
const shortUrl = require("node-url-shortener");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("shortlink")
		.setDescription("Generate a shortlink")
		.addStringOption((option) => option.setName("link").setDescription("Link to shorten").setRequired(true)),

	execute: async (interaction) => {
		await interaction.deferReply();
		shortUrl.short(interaction.options.getString("link")!, function (err: any, url: string) {
			if (err) return interaction.followUp({ content: `Error: ${err}`, ephemeral: true });

			interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle(`Shortlink Created!`)
						.setColor("Random")
						.setFields([
							{ name: "Original", value: interaction.options.getString("link")! },
							{ name: "Shorten", value: url },
						])
						.setTimestamp(),
				],
			});
		});
	},
};

export default slashCommands;
