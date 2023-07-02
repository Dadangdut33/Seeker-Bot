import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("delete")
		.setDescription("Delete someone's message. Only usable by admin and mods")
		.addStringOption((option) => option.setName("id").setDescription("Message id to delete").setRequired(true))
		.addStringOption((option) => option.setName("reason").setDescription("Reason for the deletion").setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	execute: async (interaction) => {
		const id = interaction.options.getString("id")!,
			reason = interaction.options.getString("reason")!; // reason to show in chat

		try {
			await interaction.deferReply();
			const message = await interaction.channel?.messages.fetch(id);
			interaction.editReply({ content: `Deleted message with id \`${id}\` by \`${message?.author.tag}\` for \`${reason}\`` });
			await message?.delete();
		} catch (error) {
			interaction.editReply({ content: `Unable to delete message. Got err: \`${error}\`` });

			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		}
	},
};

export default slashCommands;
