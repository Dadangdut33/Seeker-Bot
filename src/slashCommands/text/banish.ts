import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
const banish = require("to-zalgo/banish");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("banish")
		.setDescription("Normalize zalgoed text")
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		interaction.reply(banish(interaction.options.getString("text")!));
	},
};

export default slashCommands;
