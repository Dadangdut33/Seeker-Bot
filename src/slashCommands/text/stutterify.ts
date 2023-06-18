import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
const stutterify = require("stutterify");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("stutterify")
		.setDescription(`*"stutterifys"* text`)
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		interaction.reply(stutterify(interaction.options.getString("text")!));
	},
};

export default slashCommands;
