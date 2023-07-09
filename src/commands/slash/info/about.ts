import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { prettyMilliseconds } from "../../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("about").setDescription("Shows what the bot is about. This include the bot's status & description"),

	execute: (interaction) => {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Hello there!")
					.setColor("DarkBlue")
					.setThumbnail(interaction.client!.user!.displayAvatarURL())
					.setDescription(`Seeker bot. Created for private use. Made by @dadangdut33`)
					.addFields([
						{ name: "TOTAL SERVERS", value: `${interaction.client.guilds.cache.size}`, inline: true },
						{ name: "TOTAL CHANNELS", value: `${interaction.client.channels.cache.size}`, inline: true },
						{ name: "TOTAL MEMBERS", value: `${interaction.client.users.cache.size}`, inline: true },
						{ name: "ID", value: `${interaction.client.user.id}`, inline: true },
						{ name: "UPTIME", value: `${prettyMilliseconds(interaction.client.uptime)}`, inline: true },
						{
							name: "PRESENCE",
							value: interaction.client!.user!.presence.activities[0] ? interaction.client!.user!.presence.activities[0].name : `No presence set`,
							inline: false,
						},
						{ name: "Bot's Repository", value: `https://github.com/Dadangdut33/Seeker-Bot`, inline: false },
					])
					.setTimestamp(),
			],
			ephemeral: true,
		});
	},
};

export default slashCommands;
