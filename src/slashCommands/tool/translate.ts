import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { logger } from "../../logger";
import axios from "axios";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("translate")
		.setDescription("Translate text using google translate. You can use it by query or by replying to a message.")
		.addStringOption((option) => option.setName("target").setDescription("Target language code").setRequired(true).setAutocomplete(true))
		.addStringOption((option) => option.setName("query-or-id").setDescription("Text to translate / message id to translate").setRequired(true))
		.addStringOption((option) => option.setName("source").setDescription("Source language code").setAutocomplete(true)),

	autocomplete: async (interaction) => {
		try {
			const focusedValue = interaction.options.getFocused(true);
			const choices = [
				// https://developers.google.com/admin-sdk/directory/v1/languages
				{ name: "Auto", value: "auto" },
				{ name: "Amharic", value: "am" },
				{ name: "Arabic", value: "ar" },
				{ name: "Basque", value: "eu" },
				{ name: "Bengali", value: "bn" },
				{ name: "Portuguese (Brazil)", value: "pt-BR" },
				{ name: "Bulgarian", value: "bg" },
				{ name: "Catalan", value: "ca" },
				{ name: "Cherokee", value: "chr" },
				{ name: "Croatian", value: "hr" },
				{ name: "Czech", value: "cs" },
				{ name: "Danish", value: "da" },
				{ name: "Dutch", value: "nl" },
				{ name: "English (UK)", value: "en-GB" },
				{ name: "English (US)", value: "en" },
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
				{ name: "Portuguese (Portugal)", value: "pt-PT" },
				{ name: "Romanian", value: "ro" },
				{ name: "Russian", value: "ru" },
				{ name: "Serbian", value: "sr" },
				{ name: "Chinese (PRC)", value: "zh-CN" },
				{ name: "Chinese (Taiwan)", value: "zh-TW" },
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
		try {
			const source = interaction.options.getString("source") ?? "auto";
			const target = interaction.options.getString("target");
			let query = interaction.options.getString("query-or-id")!;

			await interaction.deferReply();
			try {
				// check if query is an id
				const message = await interaction.channel?.messages.fetch(query);
				if (message) query = message.content;
			} catch (error) {}

			const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURI(query)}`;
			const res = await axios.get(url);
			const data = res.data;
			const result = data[0][0][0];

			let embed = new EmbedBuilder()
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ extension: "png", size: 2048 }) })
				.setTitle(`${source} to ${target}`)
				.setDescription(result ? result : "Fail to fetch!")
				.setFooter({ text: `Via Google Translate` });

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			logger.error(`Error: ${error.message}`);
		}
	},
};

export default slashCommands;
