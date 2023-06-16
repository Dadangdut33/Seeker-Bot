import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { logger } from "../../logger";

const command: ISlashCommand = {
	command: new SlashCommandBuilder().setName("help").setDescription("Get help of a command"),

	execute: (interaction) => {
		logger.info("help command");
	},
};

export default command;
