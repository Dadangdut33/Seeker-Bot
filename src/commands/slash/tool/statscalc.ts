import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
let isNumber = require("isnumber");

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("statscalc")
		.setDescription("Calculate the statistical of given data")
		.addStringOption((option) => option.setName("args").setDescription("Collection of data in this format/example: 1 3 4 8 2").setRequired(true)),

	execute: async (interaction) => {
		const args = interaction.options.getString("args")!.replace(/\n/g, " ").split(" ");
		let parsedArgs = args.map((arg) => {
			// parse number to float from args
			return parseFloat(arg);
		});

		// Map the numbers
		let numbersToCalculate = numbers(parsedArgs);
		if (numbersToCalculate.length === 0)
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor("Random").setTitle(`Invalid arguments provided!`).setTimestamp()],
				ephemeral: true,
			});

		// Sum up the number
		let dataSum = sum(numbersToCalculate),
			avg = mean(numbersToCalculate),
			med = median(numbersToCalculate),
			mod = mode(numbersToCalculate),
			Slety = sampleletiance(numbersToCalculate), // Sample letiance
			Plety = populationletiance(numbersToCalculate), // Population letiance
			Psd = populationStdev(numbersToCalculate), // Population Standard deviation
			Ssd = sampleStdev(numbersToCalculate), // Sample Standard deviation
			dataAbs = numbersToCalculate.map((num) => {
				// Average deviation
				return Math.abs(num - avg);
			}),
			AD = sum(dataAbs) / numbersToCalculate.length,
			skew = skewness(numbersToCalculate), // Skewness scrapped from https://www.npmjs.com/package/compute-skewness
			kurt = kurtosis(numbersToCalculate); // Kurtosis Scrapped from https://www.npmjs.com/package/compute-kurtosis

		let embed = new EmbedBuilder()
			.setColor("Random")
			.setTitle(`Statistic Calculator`)
			.addFields([
				{ name: `Data Given`, value: `${numbersToCalculate.join(`, `)}`, inline: false },
				{ name: `Data Sorted `, value: `${numbersToCalculate.sort().join(`, `)}`, inline: false },
				{ name: `Data Length`, value: `${numbersToCalculate.length}`, inline: true },
				{ name: `Total`, value: `${dataSum}`, inline: true },
				{ name: `Mean`, value: `${avg}`, inline: true },
				{ name: `Median`, value: `${med}`, inline: true },
				{ name: `Mode`, value: `${mod.join(", ")}`, inline: true },
				{ name: `Sample letiance`, value: `${Slety.toFixed(4)}`, inline: true },
				{ name: `Population letiance`, value: `${Plety.toFixed(4)}`, inline: true },
				{ name: `Sample Standard Deviation`, value: `${Ssd.toFixed(4)}`, inline: true },
				{ name: `Population Standard Deviation`, value: `${Psd.toFixed(4)}`, inline: true },
				{ name: `Average Deviation`, value: AD.toFixed(4), inline: true },
				{ name: `Skewness`, value: `${skew.toFixed(4)}`, inline: true },
				{ name: `Kurtosis`, value: `${kurt.toFixed(4)}`, inline: true },
			])
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	},
};

export default slashCommands;

// Functions BELOW
// i dont remember where i scrapped this from but yea...
function kurtosis(arr: number[]) {
	if (!Array.isArray(arr)) {
		throw new TypeError("kurtosis()::invalid input argument. Must provide an array.");
	}

	let len = arr.length,
		delta = 0,
		delta_n = 0,
		delta_n2 = 0,
		term1 = 0,
		N = 0,
		mean = 0,
		M2 = 0,
		M3 = 0,
		M4 = 0,
		g;

	for (let i = 0; i < len; i++) {
		N += 1;

		delta = arr[i] - mean;
		delta_n = delta / N;
		delta_n2 = delta_n * delta_n;

		term1 = delta * delta_n * (N - 1);

		M4 += term1 * delta_n2 * (N * N - 3 * N + 3) + 6 * delta_n2 * M2 - 4 * delta_n * M3;
		M3 += term1 * delta_n * (N - 2) - 3 * delta_n * M2;
		M2 += term1;
		mean += delta_n;
	}
	// Calculate the population excess kurtosis:
	g = (N * M4) / (M2 * M2) - 3;
	// Return the corrected sample excess kurtosis:
	return ((N - 1) / ((N - 2) * (N - 3))) * ((N + 1) * g + 6);
} // end FUNCTION kurtosis()

function skewness(arr: number[]) {
	if (!Array.isArray(arr)) {
		throw new TypeError("skewness()::invalid input argument. Must provide an array.");
	}
	let len = arr.length,
		delta = 0,
		delta_n = 0,
		term1 = 0,
		N = 0,
		mean = 0,
		M2 = 0,
		M3 = 0,
		g;

	for (let i = 0; i < len; i++) {
		N += 1;

		delta = arr[i] - mean;
		delta_n = delta / N;

		term1 = delta * delta_n * (N - 1);

		M3 += term1 * delta_n * (N - 2) - 3 * delta_n * M2;
		M2 += term1;
		mean += delta_n;
	}
	// Calculate the population skewness:
	g = (Math.sqrt(N) * M3) / Math.pow(M2, 3 / 2);

	// Return the corrected sample skewness:
	return (Math.sqrt(N * (N - 1)) * g) / (N - 2);
} // end FUNCTION skewness()

function numbers(vals: number[]) {
	let nums: number[] = [];
	if (vals == null) return nums;

	for (let i = 0; i < vals.length; i++) {
		if (isNumber(vals[i])) nums.push(+vals[i]);
	}
	return nums;
}

function nsort(vals: number[]) {
	return vals.sort(function numericSort(a, b) {
		return a - b;
	});
}

function sum(vals: number[]) {
	vals = numbers(vals);
	let total = 0;
	for (let i = 0; i < vals.length; i++) {
		total += vals[i];
	}
	return total;
}

function mean(vals: number[]) {
	vals = numbers(vals);
	if (vals.length === 0) return NaN;
	return sum(vals) / vals.length;
}

function median(vals: number[]) {
	vals = numbers(vals);
	if (vals.length === 0) return NaN;

	let half = (vals.length / 2) | 0;

	vals = nsort(vals);
	if (vals.length % 2) {
		// Odd length, true middle element
		return vals[half];
	} else {
		// Even length, average middle two elements
		return (vals[half - 1] + vals[half]) / 2.0;
	}
}

function mode(array: number[]) {
	let frequency: number[] = []; // array of frequency.
	let maxFreq = 0; // holds the max frequency.
	let modes: number[] = [];

	for (let i in array) {
		frequency[array[i]] = (frequency[array[i]] || 0) + 1; // increment frequency.

		if (frequency[array[i]] > maxFreq) {
			// is this frequency > max so far ?
			maxFreq = frequency[array[i]]; // update max.
		}
	}

	for (let k in frequency) {
		if (frequency[k] === maxFreq) {
			modes.push(parseFloat(k));
		}
	}

	return modes;
}

// This helper finds the mean of all the values, then squares the difference
// from the mean for each value and returns the resulting array.  This is the
// core of the letience functions - the difference being dividing by N or N-1.
function valuesMinusMeanSquared(vals: number[]) {
	vals = numbers(vals);
	let avg = mean(vals);
	let diffs = [];
	for (let i = 0; i < vals.length; i++) {
		diffs.push(Math.pow(vals[i] - avg, 2));
	}
	return diffs;
}

// Population letiance = average squared deviation from mean
function populationletiance(vals: number[]) {
	return mean(valuesMinusMeanSquared(vals));
}

// Sample letiance
function sampleletiance(vals: number[]) {
	let diffs = valuesMinusMeanSquared(vals);
	if (diffs.length <= 1) return NaN;

	return sum(diffs) / (diffs.length - 1);
}

// Population Standard Deviation = sqrt of population letiance
function populationStdev(vals: number[]) {
	return Math.sqrt(populationletiance(vals));
}

// Sample Standard Deviation = sqrt of sample letiance
function sampleStdev(vals: number[]) {
	return Math.sqrt(sampleletiance(vals));
}
