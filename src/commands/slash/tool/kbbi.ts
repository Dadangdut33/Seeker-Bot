import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import axios from "axios";
import { load } from "cheerio";
import { htmlToText } from "html-to-text";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("kbbi")
		.setDescription("Mencari definisi kata dari KBBI")
		.addStringOption((option) => option.setName("search").setDescription("kata untuk dicari").setRequired(true)),

	execute: async (interaction) => {
		await interaction.deferReply();
		const search = interaction.options.getString("search")!;

		// get query
		const url = "https://kbbi.web.id/";
		const link = url + search;

		// Data
		const { data } = await axios.get(link);
		const $ = load(data); // parse

		// Get each respective data
		let title = $("title").text(),
			definitionGet = $('div[id = "d1"]').html()!,
			footer = $('div[id = "footer"]').text(),
			notFound = $(".notfound").text();

		// Jika tidak ada definisi
		if (notFound.length !== 0)
			return interaction.editReply({
				embeds: [
					{
						title: "Definisi tidak ditemukan!",
						description: "Tidak ditemukan definisi dari `" + search + "` Harap masukkan kata yang benar!",
					},
				],
			});

		// embed
		const embed = new EmbedBuilder()
			.setAuthor({
				name: title.replace(/<[^>]*>?/gm, ""),
				iconURL: "https://media.discordapp.net/attachments/799595012005822484/821354290237014056/favicon.png",
				url: link.replace(/ /g, "%20"),
			})
			.setDescription(`${htmlToText(definitionGet.slice(0, 2048))}`)
			.addFields([{ name: `Detail Lebih Lanjut`, value: `[Klik Disini](${link.replace(/ /g, "%20")})`, inline: false }])
			.setFooter({ text: footer });

		return interaction.editReply({ embeds: [embed] });
	},
};

export default slashCommands;
