import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { load } from "cheerio";
import axios from "axios";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("redditsave")
		.setDescription("Get media download links of a reddit post")
		.addStringOption((option) => option.setName("content").setDescription("Reddit post link").setRequired(true)),
	execute: async (interaction) => {
		const msg = await interaction.reply({ content: "Fetching the download link...", fetchReply: true });
		const args = interaction.options.getString("content")!;
		let link = `https://redditsave.com/info?url=${args}`,
			ddl;

		// Fetching the HTML using axios
		let { data } = await axios.get(link),
			$ = load(data); //Using cheerio to load the HTML fetched

		// check error
		if ($('div[class = "alert alert-danger"]').text()) return interaction.reply({ content: "Error! Please provide a valid reddit post url." });

		// Get the downloadinfo
		let downloadLink = $('div[class = "download-info"]').html()!,
			takenlink = downloadLink.match(/href=(["'])(?:(?=(\\?))\2.)*?\1/)!, // Match the link from href=
			linkOnly = takenlink.join("").match(/(["'])(?:(?=(\\?))\2.)*?\1/)!; // Match the original link now

		// get direct link
		if (args == linkOnly.join("").replace(/("|amp;)/g, "")) ddl = `No media to download`;
		else ddl = `[Click Here](${linkOnly.join("").replace(/("|amp;)/g, "")})`;

		const embed = new EmbedBuilder()
			.setColor("Random")
			.setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
			.setTitle(`Original Reddit Link`)
			.setDescription(args)
			.addFields([
				{ name: `Direct Download Link`, value: ddl, inline: true },
				{ name: `More Options`, value: `[RedditSave](${link})`, inline: true },
			])
			.setFooter({ text: `Via redditsave.com` })
			.setColor("#FF4500")
			.setTimestamp();

		msg.edit({ embeds: [embed] });
	},
};

export default slashCommands;
