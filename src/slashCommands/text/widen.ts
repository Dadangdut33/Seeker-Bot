import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
const vaporize = require("vaporwave");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("widen")
		.setDescription(`*"ｗｉｄｅｎ"* text`)
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		interaction.reply(vaporize(interaction.options.getString("text")!));
	},
};

export default slashCommands;
