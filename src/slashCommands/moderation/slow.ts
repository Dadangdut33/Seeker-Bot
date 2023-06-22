import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { ISlashCommand } from "../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("slow")
		.setDescription("Set slowmode for the current channel. Only usable by admin and mods")
		.addIntegerOption((option) =>
			option.setName("duration").setDescription("Set to 0 to turn it off. The limit is 21600 (6 hours").setRequired(true).setMinValue(0).setMaxValue(21600)
		)
		.addStringOption((option) => option.setName("reason").setDescription("Reason for the slowmode").setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	guildOnly: true,
	execute: async (interaction) => {
		const channel = interaction.channel as TextChannel,
			duration = interaction.options.getInteger("duration")!,
			reason = interaction.options.getString("reason")!;

		channel.setRateLimitPerUser(duration, reason);
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`Slowmode Has Been ${duration === 0 ? `Deactivated` : `Activated for ${duration} seconds`}`)
					.setColor("#000000")
					.setDescription(`**Reason:**\`\`\`js\n${reason}\`\`\``)
					.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ extension: "png", size: 2048 }) })
					.setTimestamp(),
			],
		});
	},
};

export default slashCommands;
