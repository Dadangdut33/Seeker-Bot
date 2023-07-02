import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Deletes messages from the current channel. Only usable by admin and mods")
		.addIntegerOption((option) => {
			return option.setMaxValue(100).setMinValue(1).setName("messagecount").setDescription("Message amount to be cleared");
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false),
	execute: (interaction) => {
		let messageCount = Number(interaction.options.get("messagecount")?.value);
		interaction.channel?.messages.fetch({ limit: messageCount }).then(async (msgs) => {
			if (interaction.channel?.type === ChannelType.DM) return;
			const deletedMessages = await interaction.channel?.bulkDelete(msgs, true);
			if (deletedMessages?.size === 0) interaction.reply("No messages were deleted.");
			else interaction.reply(`Successfully deleted ${deletedMessages?.size} message(s)`);
			setTimeout(() => interaction.deleteReply(), 5000);
		});
	},
};

export default slashCommands;
