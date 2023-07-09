import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("coinflip").setDescription("Flips coins"),

	execute: async (interaction) => {
		return interaction.reply({ content: Math.random() > 0.5 ? `Heads` : `Tails` });
	},
};

export default slashCommands;
