import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { reverseString } from "../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("reverse")
		.setDescription(`*"esrever"* text`)
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		interaction.reply(reverseString(interaction.options.getString("text")!));
	},
};

export default slashCommands;
