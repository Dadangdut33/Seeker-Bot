import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("math")
		.setDescription("Calculate maths equation")
		.addStringOption((option) => option.setName("content").setDescription("Content to be evaluated").setRequired(true)),
	execute: async (interaction) => {
		const chars: any = { x: "*", ":": "/", ",": "." }; // Map the syntax
		try {
			const result = eval(interaction.options.getString("content")!.replace(/[x:,]/g, (m) => chars[m]));

			interaction.reply(`\`${interaction.options.getString("content")!}\` = \`${result}\``);
		} catch (error) {
			interaction.reply(`\`${interaction.options.getString("content")!}\` is not a valid math equation\nError: \`${error}\``);
		}
	},
};

export default slashCommands;
