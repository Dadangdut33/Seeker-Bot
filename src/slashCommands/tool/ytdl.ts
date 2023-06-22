import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { validateURL, getInfo, chooseFormat, getVideoID } from "ytdl-core";

async function highestVideo(url: string) {
	let info = await getInfo(url);
	let format = chooseFormat(info.formats, { quality: "highestvideo", filter: "audioandvideo" });
	return format;
}

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("ytdl")
		.setDescription("Get a yt video download link")
		.addStringOption((option) => option.setName("url").setDescription("Description").setRequired(true)),
	execute: async (interaction) => {
		const url = interaction.options.getString("url")!;
		if (!validateURL(url)) return interaction.reply({ content: "Error! Please provide a valid youtube video URL.", ephemeral: true });

		const msg = await interaction.reply(`Please wait... Video URL: \`${url}\``);

		let vFormat = await highestVideo(url);
		let embed = new EmbedBuilder()
			.setColor("Random")
			.setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ extension: "png", size: 2048 }) })
			.setTitle(`Info Get`)
			.setDescription(`Original Link: ${url}\nmimeType: \`${vFormat.mimeType}\``)
			.addFields([
				{ name: "Video ID", value: `\`${getVideoID(url)}\``, inline: true },
				{ name: "FPS", value: `${vFormat.fps}`, inline: true },
				{ name: "Bitrate", value: `${vFormat.bitrate}`, inline: true },
				{ name: "Audio Bitrate", value: `${vFormat.audioBitrate}`, inline: true },
				{ name: "Resolution", value: `${vFormat.width}x${vFormat.height}`, inline: true },
				{ name: "Video Format", value: `${vFormat.container}`, inline: true },
				{ name: `Download link [${vFormat.quality}/${vFormat.qualityLabel}]`, value: `[Download](${vFormat.url})`, inline: false },
			])
			.setColor("#FF0000")
			.setTimestamp();

		msg.edit({ content: "", embeds: [embed] });
	},
};

export default slashCommands;
