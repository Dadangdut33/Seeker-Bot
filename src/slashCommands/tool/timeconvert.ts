import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { logger } from "../../logger";
import moment from "moment-timezone";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("timeconvert")
		.setDescription("Convert timezone GMT (+/-)")
		.addStringOption((option) => option.setName("notation-from").setDescription("+ or -").setRequired(true).setAutocomplete(true))
		.addIntegerOption((option) => option.setName("timezone-from").setDescription("Timezone from").setRequired(true))
		.addStringOption((option) => option.setName("notation-to").setDescription("+ or -").setRequired(true).setAutocomplete(true))
		.addIntegerOption((option) => option.setName("timezone-to").setDescription("Timezone to").setRequired(true)),
	autocomplete: async (interaction) => {
		try {
			const focusedValue = interaction.options.getFocused();
			const choices = [
				{ name: "+", value: "+" },
				{ name: "-", value: "-" },
			];
			let filtered: { name: string; value: string }[] = [];
			for (let i = 0; i < choices.length; i++) {
				const choice = choices[i];
				if (choice.name.includes(focusedValue)) filtered.push(choice);
			}
			await interaction.respond(filtered);
		} catch (error) {
			logger.error(`Error: ${error.message}`);
		}
	},
	execute: async (interaction) => {
		const args = [
			interaction.options.getString("notation-from"),
			interaction.options.getInteger("timezone-from"),
			interaction.options.getString("notation-to"),
			interaction.options.getInteger("timezone-to"),
		];

		let dateFrom = moment.tz(`Etc/GMT${args[0] === "+" ? `-${args[1]}` : `+${args[1]}`}`).format("dddd DD MMMM YYYY HH:mm:ss"),
			dateTo = moment.tz(`Etc/GMT${args[2] === "+" ? `-${args[3]}` : `+${args[3]}`}`).format("dddd DD MMMM YYYY HH:mm:ss"),
			diff = parseInt(`${args[0]}${args[1]}`) - parseInt(`${args[2]}${args[3]}`),
			embed = new EmbedBuilder()
				.setTitle(`Conversion of GMT${args[0]}${args[1]} to GMT${args[2]}${args[3]}`)
				.setDescription(`The difference between the two is \`${diff} Hours\``)
				.addFields([
					{ name: `GMT${args[0]}${args[1]}`, value: dateFrom },
					{ name: `GMT${args[2]}${args[3]}`, value: dateTo },
				])
				.setFooter({ text: `Current Local Time ->` })
				.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	},
};

export default slashCommands;
