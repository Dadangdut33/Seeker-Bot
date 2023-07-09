import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { getVideoID, validateURL } from "ytdl-core";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("ytthumbnail")
		.setDescription("Get a yt video thumbnail")
		.addStringOption((option) => option.setName("url").setDescription("Description").setRequired(true)),
	execute: async (interaction) => {
		const url = interaction.options.getString("url")!;
		if (!validateURL(url)) return interaction.reply({ content: "Error! Please provide a valid youtube video URL.", ephemeral: true });

		const theID = getVideoID(url);
		const defaultImg = `https://img.youtube.com/vi/${theID}/default.jpg`, // Default thumbnail
			hqDefault = `https://img.youtube.com/vi/${theID}/hqdefault.jpg`, // High Quality
			mqDefault = `https://img.youtube.com/vi/${theID}/mqdefault.jpg`, // Medium Quality
			sdDefault = `https://img.youtube.com/vi/${theID}/sddefault.jpg`, // Standard Definition
			maxDefault = `https://img.youtube.com/vi/${theID}/maxresdefault.jpg`;

		await interaction.deferReply();
		const embed = new EmbedBuilder()
			.setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ extension: "png", size: 2048 }) })
			.setTitle(`Link Info`)
			.setDescription(`**Video ID:** \`${theID}\`\n**Original Link:**\n${url}`)
			.addFields([
				{
					name: `Link to The Thumbnail`,
					value: `[Default Quality](${defaultImg}) | [HQ](${hqDefault}) | [MQ](${mqDefault}) | [SD](${sdDefault}) | [Maxres](${maxDefault})\n\n:arrow_down: **Preview of SD Quality**`,
				},
			])
			.setImage(sdDefault)
			.setColor("#FF0000")
			.setTimestamp();

		await interaction.followUp({ content: "", embeds: [embed] });
	},
};

export default slashCommands;
