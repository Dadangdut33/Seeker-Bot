import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
const tinytext = require("tiny-text");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("tinify")
		.setDescription("`ˢᵐᵃᶫᶫᶦᶠʸˢ` text")
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true)),
	execute: async (interaction) => {
		interaction.reply(tinytext(interaction.options.getString("text")!));
	},
};

export default slashCommands;
