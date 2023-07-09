import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("tempconvert")
		.setDescription("Convert temperature provided into Celcius (C), Fahrenheit (F), Reamur (R), and Kelvin (K)")
		.addStringOption((option) =>
			option
				.setName("unit")
				.setDescription("Unit of the temperature")
				.setRequired(true)
				.addChoices({ name: "Celcius", value: "c" }, { name: "Fahrenheit", value: "f" }, { name: "Reamur", value: "r" }, { name: "Kelvin", value: "k" })
		)
		.addNumberOption((option) => option.setName("temperature").setDescription("Temperature to convert").setRequired(true)),

	execute: async (interaction) => {
		const unit = interaction.options.getString("unit")!;
		const temperature = interaction.options.getNumber("temperature")!;

		const convertDict: any = {
			c: ["Celcius", celciusToFahrenheit, celciusToReamur, celciusToKelvin],
			f: ["Fahrenheit", fahrenheitToCelcius, fahrenheitToReamur, fahrenheitToKelvin],
			r: ["Reamur", reamurToCelcius, reamurToFahrenheit, reamurToKelvin],
			k: ["Kelvin", kelvinToCelcius, kelvinToFahrenheit, kelvinToReamur],
		};

		let embed = new EmbedBuilder()
			.setColor("Random")
			.setTitle(`${temperature}° ${convertDict[unit][0]} Converted To`)
			.addFields([
				{
					name: `${convertDict[unit][1](temperature).name}`,
					value: `${convertDict[unit][1](temperature).value.toFixed(2)}° ${convertDict[unit][1](temperature).name.charAt(0)}`,
					inline: true,
				},
				{
					name: `${convertDict[unit][2](temperature).name}`,
					value: `${convertDict[unit][2](temperature).value.toFixed(2)}° ${convertDict[unit][2](temperature).name.charAt(0)}`,
					inline: true,
				},
				{
					name: `${convertDict[unit][3](temperature).name}`,
					value: `${convertDict[unit][3](temperature).value.toFixed(2)}° ${convertDict[unit][3](temperature).name.charAt(0)}`,
					inline: true,
				},
			]);

		return interaction.reply({ embeds: [embed] });
	},
};

export default slashCommands;

//Celcius
function celciusToFahrenheit(c: number) {
	return { name: "Fahrenheit", value: (c * 9) / 5 + 32 };
}

function celciusToReamur(c: number) {
	return { name: "Reamur", value: (c * 4) / 5 };
}

function celciusToKelvin(c: number) {
	return { name: "Kelvin", value: c + 273.16 };
}

//Fahrenheit
function fahrenheitToCelcius(f: number) {
	return { name: "Celcius", value: ((f - 32) * 5) / 9 };
}

function fahrenheitToReamur(f: number) {
	return { name: "Reamur", value: ((f - 32) * 4) / 9 };
}

function fahrenheitToKelvin(f: number) {
	return { name: "Kelvin", value: ((f - 32) * 5) / 9 + 273.16 };
}

//Reamur
function reamurToCelcius(r: number) {
	return { name: "Celcius", value: (r * 5) / 4 };
}

function reamurToFahrenheit(r: number) {
	return { name: "Fahrenheit", value: (r * 9) / 4 + 32 };
}

function reamurToKelvin(r: number) {
	return { name: "Kelvin", value: (r * 5) / 4 + 273.16 };
}

//Kelvin
function kelvinToCelcius(k: number) {
	return { name: "Celcius", value: k - 273.16 };
}

function kelvinToFahrenheit(k: number) {
	return { name: "Fahrenheit", value: ((k - 273.16) * 9) / 5 + 32 };
}

function kelvinToReamur(k: number) {
	return { name: "Reamur", value: ((k - 273.16) * 4) / 5 };
}
