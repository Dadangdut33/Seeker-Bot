import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { fancy } from "../../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("fancyfies")
		.setDescription(`*"𝒻𝒶𝓃𝒸𝓎"* text`)
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000))
		.addBooleanOption((option) => option.setName("bold").setDescription("Bold output")),
	execute: async (interaction) => {
		let text = interaction.options.getString("text")!,
			bold = interaction.options.getBoolean("bold");

		text = fancy(text);

		if (bold) interaction.reply("**" + text + "**");
		else interaction.reply(text);
	},
};

export default slashCommands;
