import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { join } from "path";
import { logColor, walkdir } from "../utils";
import { Command, SlashCommand } from "../types";
import { logger } from "../logger";

module.exports = (client: Client) => {
	const slashCommands: SlashCommandBuilder[] = [];
	const commands: Command[] = [];

	let slashCommandsDir = join(__dirname, "../slashCommands");
	let commandsDir = join(__dirname, "../commands");

	// load slash commands
	logger.info(logColor("text", `🔥 Loading slash commands...`));
	walkdir(slashCommandsDir).forEach((file) => {
		if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
		let command: SlashCommand = require(file).default;
		if (command.disabled) return; // check disabled
		slashCommands.push(command.command);
		client.slashCommands.set(command.command.name, command);
	});

	// load regular commands
	logger.info(logColor("text", `🔥 Loading commands...`));
	walkdir(commandsDir).forEach((file) => {
		if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
		let command: Command = require(file).default;
		if (command.disabled) return; // check disabled
		commands.push(command);
		client.commands.set(command.name, command);
	});

	// register slash commands as a simple REST API for discord
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
