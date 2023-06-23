import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { CUSTOM_COLORS } from "../../utils";
import { ISlashCommand } from "../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("ping").setDescription("Shows the bot's ping"),
	execute: async (interaction) => {
		const msg = await interaction.deferReply({ fetchReply: true });

		await interaction.followUp({
			embeds: [
				// prettier-ignore
				new EmbedBuilder()
					.setTitle( "🏓 Pong!")
					.setDescription(`📶 Latency: \`${Math.floor(msg.createdTimestamp - interaction.createdTimestamp)}ms\`\n📡 API Latency: \`${Math.round(interaction.client.ws.ping)}ms\``)
					.setColor(CUSTOM_COLORS.Aqua),
			],
		});
	},
};

export default slashCommands;
