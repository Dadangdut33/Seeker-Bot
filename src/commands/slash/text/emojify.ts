import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import GraphemeSplitter from "grapheme-splitter";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("emojify")
		.setDescription("Emojifies text")
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		let splitted = new GraphemeSplitter().splitGraphemes(interaction.options.getString("text")!),
			regExp = /^[a-zA-Z]+$/;

		for (let i = 0; i < splitted.length; i++) {
			if (regExp.test(splitted[i])) splitted[i] = `:regional_indicator_${splitted[i]}:`;
		}

		interaction.reply(splitted.join(" "));
	},
};

export default slashCommands;
