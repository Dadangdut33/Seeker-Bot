import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { capitalizeTheFirstLetterOfEachWord } from "../../utils";
import ct from "countries-and-timezones";
const cities = require("all-the-cities");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("citycoordinate")
		.setDescription("Get city coordinate")
		.addStringOption((option) => option.setName("query").setDescription("City to search").setRequired(true)),

	execute: async (interaction) => {
		await interaction.deferReply();
		const search = interaction.options.getString("query")!;
		let result = cities.filter((city: any) => city.name.match(capitalizeTheFirstLetterOfEachWord(search)));
		if (!result[0])
			return interaction.editReply({
				embeds: [
					{
						color: 0x000000,
						description: "Can't find the city, maybe you type it wrong?",
					},
				],
			});

		let location = result[0].loc.coordinates, //Location
			timezones = ct.getTimezonesForCountry(result[0].country); //Timezone

		let embed = new EmbedBuilder()
			.setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ extension: "png", size: 2048 }) })
			.setTitle(`${result[0].name} [${result[0].country}]\n**Population:** ${result[0].population}\n**Coordinates**: \`${location[1]}, ${location[0]}\``)
			.addFields([
				{ name: `City ID`, value: result[0].cityId.toString(), inline: true },
				{ name: `Feature Code`, value: result[0].featureCode.toString(), inline: true },
				{ name: `Admin Code`, value: result[0].adminCode.toString(), inline: true },
			])
			.setTimestamp();

		// timezone, slice to 20 per field
		const loopAmount = Math.ceil(timezones.length / 20); // get loop amount
		if (loopAmount > 0) {
			for (let i = 0; i < loopAmount; i++) {
				let sliced = timezones.slice(i * 20, i * 20 + 20);
				const toAdd = [];
				for (let j = 0; j < sliced.length; j++) {
					toAdd.push(`${sliced[j].name} [${sliced[j].utcOffsetStr}]`);
				}
				embed.addFields([{ name: i === 0 ? `Timezones in country` : `Cont.`, value: toAdd.join("\n") }]);
			}
		}

		return interaction.editReply({ embeds: [embed] });
	},
};

export default slashCommands;
