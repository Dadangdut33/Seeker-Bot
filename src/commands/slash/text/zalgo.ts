import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
const zalgo = require("to-zalgo");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("zalgo")
		.setDescription("Zalgo text")
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		interaction.reply(zalgo(interaction.options.getString("text")!));
	},
};

export default slashCommands;
