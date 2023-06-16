import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { join } from "path";
import { logColor, walkdir } from "../utils";
import { ICommand, ISlashCommand } from "../types";
import { logger } from "../logger";

/**
 * @description
 * This handler loads all slash commands and regular commands from the src/slashCommands and src/commands folders.
 * After that it registers the slash commands as a simple REST API for discord.
 */
module.exports = (client: Client) => {
	const slashCommands: SlashCommandBuilder[] = [],
		commands: ICommand[] = [],
		slashCommandsDir = join(__dirname, "../slashCommands"),
		commandsDir = join(__dirname, "../commands");

	logger.info(logColor("text", `🔥 Loading slash commands...`));
	walkdir(slashCommandsDir).forEach((file) => {
		if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
		let slashCommand: ISlashCommand = require(file).default;

		if (!slashCommand) return logger.warn(logColor("warning", `Slash command ${logColor("variable", file)} is not a valid slash command`));
		if (slashCommand.disabled) return; // check disabled

		slashCommands.push(slashCommand.command);
		client.slashCommands.set(slashCommand.command.name, slashCommand);
	});

	logger.info(logColor("text", `🔥 Loading commands...`));
	walkdir(commandsDir).forEach((file) => {
		if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
		let command: ICommand = require(file).default;

		if (!command) return logger.warn(logColor("warning", `Command ${logColor("variable", file)} is not a valid command`));
		if (command.disabled) return; // check disabled

		commands.push(command);
		client.commands.set(command.name, command);
	});

	const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

	rest
		.put(Routes.applicationCommands(process.env.CLIENT_ID), {
			body: slashCommands.map((command) => command.toJSON()),
		})
		.then((data: any) => {
			logger.info(logColor("text", `🔥 Successfully loaded ${logColor("variable", data.length)} slash command(s)`));
			logger.info(logColor("text", `🔥 Successfully loaded ${logColor("variable", commands.length)} command(s)`));
		})
		.catch((e) => {
			logger.error(e);
		});
};
