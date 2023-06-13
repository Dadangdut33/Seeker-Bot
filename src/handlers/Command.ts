import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { readdirSync } from "fs";
import { join } from "path";
import { color } from "../functions";
import { Command, SlashCommand } from "../types";

module.exports = (client: Client) => {
	const slashCommands: SlashCommandBuilder[] = [];
	const commands: Command[] = [];

	let slashCommandsDir = join(__dirname, "../slashCommands");
	let commandsDir = join(__dirname, "../commands");

	// load slash commands
	readdirSync(slashCommandsDir).forEach((file) => {
		if (!file.endsWith(".js")) return;
		let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
		if (command.disabled) return; // check disabled
		slashCommands.push(command.command);
		client.slashCommands.set(command.command.name, command);
	});

	// load regular commands
	readdirSync(commandsDir).forEach((file) => {
		if (!file.endsWith(".js")) return;
		let command: Command = require(`${commandsDir}/${file}`).default;
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
			console.log(color("text", `🔥 Successfully loaded ${color("variable", data.length)} slash command(s)`));
			console.log(color("text", `🔥 Successfully loaded ${color("variable", commands.length)} command(s)`));
		})
		.catch((e) => {
			console.log(e);
		});
};
