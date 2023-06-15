import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { CUSTOM_COLORS } from "../utils";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	command: new SlashCommandBuilder().setName("ping").setDescription("Shows the bot's ping"),
	execute: async (interaction) => {
		interaction.reply({
			embeds: [
				// prettier-ignore
				new EmbedBuilder()
					.setAuthor({ name: "MRC License" })
					.setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
					.setColor(CUSTOM_COLORS.Aqua),
			],
		});
	},
	cooldown: 10,
};

export default command;
