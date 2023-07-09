import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { getAnimeImgURLV2 } from "../../../utils/commands";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("action")
		.setDescription("Do some action")
		.addStringOption((options) =>
			options
				.setName("type")
				.setDescription("Type of action")
				.setRequired(true)
				.addChoices(
					{ name: "hug", value: "hug" },
					{ name: "laugh", value: "laugh" },
					{ name: "pat", value: "pat" },
					{ name: "poke", value: "poke" },
					{ name: "slap", value: "slap" },
					{ name: "smug", value: "smug" }
				)
		)
		.addUserOption((options) => options.setName("user").setDescription("Target of the action / action receiver")),

	execute: async (interaction) => {
		let data = await getAnimeImgURLV2(interaction.options.getString("type")! as any);

		if (!data) return interaction.reply({ content: "Something went wrong", ephemeral: true });

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						`${interaction.user.username} ${
							interaction.options.getUser("user")
								? interaction.options.getString("type")! + "s <@" + interaction.options.getUser("user") + ">"
								: interaction.options.getString("type")! + "s"
						}`
					)
					.setColor("Random")
					.setImage(data),
			],
			allowedMentions: { repliedUser: false },
		});
	},
};

export default slashCommands;
