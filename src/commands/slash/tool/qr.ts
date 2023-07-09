import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("qr")
		.setDescription("Convert text (Can be link or just plain text) to QR code")
		.addStringOption((option) => option.setName("content").setDescription("Content to be generated to QR code").setRequired(true))
		.addBooleanOption((option) => option.setName("private").setDescription("Send the result only to you?").setRequired(false)),
	execute: async (interaction) => {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor("Random")
					.setDescription(`**Original Text**\n${interaction.options.getString("content")}`)
					.setTitle(`:arrow_down: QR Code Generated`)
					.setImage(`http://api.qrserver.com/v1/create-qr-code/?data=${interaction.options.getString("content")}&size=400x400`),
			],
			ephemeral: interaction.options.getBoolean("private") ?? false,
		});
	},
};

export default slashCommands;
