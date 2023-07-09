import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";

function getRandomIntInclusive(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("rng")
		.setDescription("Generate random number")
		.addIntegerOption((option) => option.setName("min").setDescription("Minimum range").setRequired(true))
		.addIntegerOption((option) => option.setName("max").setDescription("Maximum range").setRequired(true)),
	execute: async (interaction) => {
		let min = interaction.options.getInteger("min")!,
			max = interaction.options.getInteger("max")!;

		// swap if min > max
		if (min > max) {
			let temp = min;
			min = max;
			max = temp;
		}

		interaction.reply(`\`RNG(${min}, ${max})\`= ${getRandomIntInclusive(min, max)}`);
	},
};

export default slashCommands;
