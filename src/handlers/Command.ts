import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { CMD_BTN_DIR, CMD_MSG_DIR, CMD_SLASH_DIR, logColor, walkdir } from "../utils";
import { IButtonCommand, ICommand, ISlashCommand } from "../types";
import { logger } from "../logger";
import { env } from "@/env";
import fastify from "fastify";

/**
 * @description
 * This handler loads all slash commands and regular commands from the src/slashCommands and src/commands folders.
 * After that it registers the slash commands as a simple REST API for discord.
 */
module.exports = (client: Client) => {
	const slashCommands: SlashCommandBuilder[] = [],
		commands: ICommand[] = [];

	// ------------------------------ //
	logger.info(logColor("text", `🔥 Loading commands...`));
	walkdir(CMD_MSG_DIR).forEach((file) => {
		try {
			if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
			let command: ICommand = require(file).default;

			if (!command) return logger.warn(logColor("warning", `Command ${logColor("variable", file)} is not a valid command`));
			if (command.disabled) return; // check disabled

			commands.push(command);
			client.commands.set(command.name, command);
		} catch (error) {
			logger.error(`Error in ${file}`);
			logger.error(`${error}`);
		}
	});

	logger.info(logColor("text", `🔥 Loading slash commands...`));
	walkdir(CMD_SLASH_DIR).forEach((file) => {
		try {
			if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
			let slashCommand: ISlashCommand = require(file).default;

			if (!slashCommand) return logger.warn(logColor("warning", `Slash command ${logColor("variable", file)} is not a valid slash command`));
			if (slashCommand.disabled) return; // check disabled

			slashCommands.push(slashCommand.command);
			client.slashCommands.set(slashCommand.command.name, slashCommand);
		} catch (error) {
			logger.error(`Error in ${file}`);
			logger.error(`${error}`);
		}
	});

	logger.info(logColor("text", `🔥 Loading button commands...`));
	walkdir(CMD_BTN_DIR).forEach((file) => {
		try {
			if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
			let buttonCommand: IButtonCommand = require(file).default;

			if (!buttonCommand) return logger.warn(logColor("warning", `Button command ${logColor("variable", file)} is not a valid button command`));
			if (buttonCommand.disabled) return; // check disabled

			client.buttonCommands.set(buttonCommand.id, buttonCommand);
		} catch (error) {
			logger.error(`Error in ${file}`);
			logger.error(`${error}`);
		}
	});

	const app = fastify({
		logger: true,
	});
	const port = parseInt(env.PORT) || 10032;

	app.get("/", (_req, res) => res.send("Hello World! Bot is running"));
	app.put(Routes.applicationCommands(process.env.CLIENT_ID), (_req, res) => {
		res.send(slashCommands.map((command) => command.toJSON()));
	});
	// app.listen(port, () => logger.info(`Server listening at http://localhost:${port}`));
	app.listen({ port, host: "0.0.0.0" });
};
