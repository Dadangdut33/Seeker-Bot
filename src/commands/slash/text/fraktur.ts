import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
const fraktur = require("fraktur");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("fraktur")
		.setDescription(`*"𝔣𝔯𝔞𝔨𝔱𝔲𝔯"* text`)
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000))
		.addBooleanOption((option) => option.setName("bold").setDescription("Bold output")),
	execute: async (interaction) => {
		let text = interaction.options.getString("text")!,
			bold = interaction.options.getBoolean("bold");

		text = fraktur.encode(text);

		if (bold) interaction.reply("**" + text + "**");
		else interaction.reply(text);
	},
};

export default slashCommands;
