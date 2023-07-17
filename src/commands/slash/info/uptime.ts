import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { convertToEpoch, prettyMilliseconds } from "../../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("uptime").setDescription("Get bot's uptime"),

	execute: (interaction) => {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor("Random")
					.addFields([
						{ name: "Booted up on", value: `<t:${convertToEpoch(interaction.client.readyAt)}>`, inline: true },
						{ name: "Uptime", value: `${prettyMilliseconds(interaction.client.uptime)}`, inline: true },
					])
					.setTimestamp(),
			],
			ephemeral: true,
		});
	},
};

export default slashCommands;
