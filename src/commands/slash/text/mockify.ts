import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { autist_text } from "../../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("mockify")
		.setDescription("Mock someone with this. Example: `i'M tExT`")
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		interaction.reply(autist_text(interaction.options.getString("text") as string));
	},
};

export default slashCommands;
