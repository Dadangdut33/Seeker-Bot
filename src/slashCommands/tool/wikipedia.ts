import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { logger } from "../../logger";
import axios from "axios";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("wikipedia")
		.setDescription("Search Wikipedia for an article")
		.addStringOption((option) => option.setName("language").setDescription("Wikipedia language").setRequired(true).setAutocomplete(true))
		.addStringOption((option) => option.setName("query").setDescription("Article to search").setRequired(true)),

	autocomplete: async (interaction) => {
		try {
			const focusedValue = interaction.options.getFocused(true);
			const choices = [
				{ name: "Amharic", value: "am" },
				{ name: "Arabic", value: "ar" },
				{ name: "Basque", value: "eu" },
				{ name: "Bengali", value: "bn" },
				{ name: "Bulgarian", value: "bg" },
				{ name: "Catalan", value: "ca" },
				{ name: "Cherokee", value: "chr" },
				{ name: "Croatian", value: "hr" },
				{ name: "Czech", value: "cs" },
				{ name: "Danish", value: "da" },
				{ name: "Dutch", value: "nl" },
				{ name: "English", value: "en" },
				{ name: "Estonian", value: "et" },
				{ name: "Filipino", value: "fil" },
				{ name: "Finnish", value: "fi" },
				{ name: "French", value: "fr" },
				{ name: "German", value: "de" },
				{ name: "Greek", value: "el" },
				{ name: "Gujarati", value: "gu" },
				{ name: "Hebrew", value: "iw" },
				{ name: "Hindi", value: "hi" },
				{ name: "Hungarian", value: "hu" },
				{ name: "Icelandic", value: "is" },
				{ name: "Indonesian", value: "id" },
				{ name: "Italian", value: "it" },
				{ name: "Japanese", value: "ja" },
				{ name: "Kannada", value: "kn" },
				{ name: "Korean", value: "ko" },
				{ name: "Latvian", value: "lv" },
				{ name: "Lithuanian", value: "lt" },
				{ name: "Malay", value: "ms" },
				{ name: "Malayalam", value: "ml" },
				{ name: "Marathi", value: "mr" },
				{ name: "Norwegian", value: "no" },
				{ name: "Polish", value: "pl" },
				{ name: "Portuguese (Brazil)", value: "br" },
				{ name: "Portuguese (Portugal)", value: "pt" },
				{ name: "Romanian", value: "ro" },
				{ name: "Russian", value: "ru" },
				{ name: "Serbian", value: "sr" },
				{ name: "Chinese", value: "zh" },
				{ name: "Slovak", value: "sk" },
				{ name: "Slovenian", value: "sl" },
				{ name: "Spanish", value: "es" },
				{ name: "Swahili", value: "sw" },
				{ name: "Swedish", value: "sv" },
				{ name: "Tamil", value: "ta" },
				{ name: "Telugu", value: "te" },
				{ name: "Thai", value: "th" },
				{ name: "Turkish", value: "tr" },
				{ name: "Urdu", value: "ur" },
				{ name: "Ukrainian", value: "uk" },
				{ name: "Vietnamese", value: "vi" },
				{ name: "Welsh", value: "cy" },
			];
			let filtered: { name: string; value: string }[] = [];
			for (let i = 0; i < choices.length; i++) {
				const choice = choices[i];
				if (choice.name.includes(focusedValue.value)) filtered.push(choice);
			}

			// filter 25 choices max because of discord limit
			filtered = filtered.slice(0, 25);

			// if interaction is target, remove auto
			if (focusedValue.name === "target") {
				filtered = filtered.filter((choice) => choice.value !== "auto");
			}

			await interaction.respond(filtered);
		} catch (error) {
			logger.error(`Error: ${error.message}`);
		}
	},
	execute: async (interaction) => {
		const language = interaction.options.getString("language")!,
			query = interaction.options.getString("query")!;

		const footer = `Via ${language} Wikipedia`,
			author = "© Wikipedia.org",
			authorpic = "https://i.imgur.com/fnhlGh5.png",
			authorlink = "https://id.wikipedia.org/",
			url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/`,
			link = url + query.replace(/ /g, "_");

		await interaction.deferReply();
		try {
			const { data } = await axios.get(link);

			let embed = new EmbedBuilder()
				.setAuthor({ name: author, iconURL: authorpic, url: authorlink })
				.setColor("Random")
				.setDescription(`${data.extract}`)
				.setFooter({ text: footer })
				.setThumbnail(`${data.thumbnail ? data.thumbnail.source : ""}`)
				.setTitle(`${data.title}`)
				.setURL(`${data.content_urls.desktop.page}`)
				.setTimestamp();

			return interaction.editReply({ embeds: [embed] });
		} catch (error) {
			if (error.response.status === 403) return interaction.editReply("Wikipedia is down, try again later.");
			if (error.response.status === 404) return interaction.editReply(`I couldn't find that article on Wikipedia or maybe you type it wrong?`);
			else {
				console.log(error);
				// return message.channel.send(`Error ${error}`);
				interaction.editReply(`Error ${error}`);
			}
		}
	},
};

export default slashCommands;
