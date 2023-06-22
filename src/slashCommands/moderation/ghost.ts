import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("ghost")
		.setDescription("Ghost message. Only usable by admin and mods")
		.addStringOption((option) => option.setName("content").setDescription("Ghost content").setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	guildOnly: true,
	execute: async (interaction) => {
		const ghost = await interaction.reply({ content: interaction.options.getString("content")! });

		setTimeout(() => {
			ghost.delete();
		}, 1000);
	},
};

export default slashCommands;
