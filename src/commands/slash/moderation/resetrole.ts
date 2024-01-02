import { PermissionFlagsBits, Role, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { logger } from "../../../logger";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("resetrole")
		.setDescription("Reset roles, only usable by admin and mods")
		.addRoleOption((option) => option.setName("role").setDescription("Role to reset").setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	execute: async (interaction) => {
		const roleToReset = interaction.options.getRole("role")!;
		const guild = interaction.guild!;
		await interaction.deferReply();
		try {
			guild.members.cache.forEach((member) => {
				member.roles.remove(roleToReset as Role);
			});
			await interaction.editReply("__**Roles have been reset successfully!**__ Might take a while to see the changes.");
		} catch (error) {
			logger.error(`${error}`);
			await interaction.editReply("__**Something went wrong!**__\n```js\n" + error + "```");
		}
	},
};

export default slashCommands;
