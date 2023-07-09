import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { convertToEpoch } from "../../../utils";
const weather = require("weather-js");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("weather")
		.setDescription("Get weather information of a given location")
		.addStringOption((option) => option.setName("location").setDescription("Location to search").setRequired(true)),

	execute: async (interaction) => {
		await interaction.deferReply();
		const search = interaction.options.getString("location")!;

		weather.find({ search: search, degreeType: "C" }, function (err: any, result: any) {
			try {
				let embed = new EmbedBuilder()
					.setTitle(`Weather Condition of ${result[0].location.name} (${result[0].current.date})`)
					.setColor("Random")
					.setDescription("Results may not be 100% accurate")
					.addFields([
						{ name: "Temperature/Feels Like", value: `${result[0].current.temperature}°C/${result[0].current.feelslike}°C`, inline: true },
						{ name: "Sky", value: result[0].current.skytext, inline: true },
						{ name: "Humidity", value: result[0].current.humidity, inline: true },
						{ name: "Wind", value: result[0].current.winddisplay, inline: true },
						{ name: "Alert", value: `${result[0].location.alert ? result[0].location.alert : "-"}`, inline: true },
						{ name: "Timezone", value: `${result[0].location.timezone}`, inline: true },
						{ name: "Lat/Long", value: `${result[0].location.lat}/${result[0].location.long}`, inline: true },
						{ name: "Observation Time", value: result[0].current.observationtime, inline: true },
						{ name: "Observation Point", value: result[0].current.observationpoint, inline: true },
						{ name: "5 Days Forecast", value: `Currently: <t:${convertToEpoch(new Date())}> `, inline: false },
					])
					.setThumbnail(result[0].current.imageUrl)
					.setFooter({ text: `Via msn.com`, iconURL: `https://www.msn.com/favicon.ico` });

				for (let i = 0; i < result[0].forecast.length; i++) {
					embed.addFields([
						{
							name: `${result[0].forecast[i].day}`,
							value: `Date: ${result[0].forecast[i].date}\nLow: ${result[0].forecast[i].low}\nHigh: ${result[0].forecast[i].low}\nSky: ${
								result[0].forecast[i].skytextday
							}\nPrecip: ${result[0].forecast[i].precip ? result[0].forecast[i].precip : "-"}`,
							inline: true,
						},
					]);
				}

				return interaction.editReply({ embeds: [embed] });
			} catch (err) {
				return interaction.editReply(`Unable to get data of the given location\n\n**Details:** ${err}`);
			}
		});
	},
};

export default slashCommands;
