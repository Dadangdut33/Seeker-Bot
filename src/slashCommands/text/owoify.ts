import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
const owoify = require("owoify-js").default;

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("owoify")
		.setDescription(`*"owoifys"* text`)
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		interaction.reply(owoify(interaction.options.getString("text")!));
	},
};

export default slashCommands;
