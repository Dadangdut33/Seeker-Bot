import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { cmd_btn_dir, cmd_msg_dir, cmd_slash_dir, logColor, walkdir } from "../utils";
import { IButtonCommand, ICommand, ISlashCommand } from "../types";
import { logger } from "../logger";
import express, { Request, Response } from "express";

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
	walkdir(cmd_msg_dir).forEach((file) => {
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
	walkdir(cmd_slash_dir).forEach((file) => {
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
	walkdir(cmd_btn_dir).forEach((file) => {
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

	const app = express();
	const port = process.env.PORT || 10032;

	app.get("/", (_req: Request, res: Response) => res.send("<h1>Hello World!</h1>"));
	app.put(Routes.applicationCommands(process.env.CLIENT_ID), (_req: Request, res: Response) => {
		res.send(slashCommands.map((command) => command.toJSON()));
	});
	app.listen(port, () => logger.info(`Server listening at http://localhost:${port}`));
};
