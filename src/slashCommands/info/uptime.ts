import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { prettyMilliseconds } from "../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("about").setDescription("Get bot's uptime"),

	execute: (interaction) => {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor("Random")
					.addFields([
						{ name: "Booted up on", value: `<t:${interaction.client.readyAt.getTime()}>`, inline: true },
						{ name: "Uptime", value: `${prettyMilliseconds(interaction.client.uptime)}`, inline: true },
					])
					.setTimestamp(),
			],
			ephemeral: true,
		});
	},
};

export default slashCommands;
