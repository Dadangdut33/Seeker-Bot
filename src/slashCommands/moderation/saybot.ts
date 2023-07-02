import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("saybot")
		.setDescription("Make the bot say your message. Only usable by admin and mods")
		.addStringOption((option) => option.setName("content").setDescription("Message to send").setRequired(true))
		.addBooleanOption((option) => option.setName("embed").setDescription("Send as embed?").setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	execute: async (interaction) => {
		if (interaction.options.getBoolean("embed") === true) {
			const embed = new EmbedBuilder()
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ extension: "jpg", size: 2048 }) })
				.setDescription(interaction.options.getString("content")!)
				.setColor("NotQuiteBlack");

			interaction.reply({ embeds: [embed] });
		} else {
			interaction.reply(interaction.options.getString("content")!);
		}
	},
};

export default slashCommands;
