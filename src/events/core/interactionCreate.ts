import { Interaction } from "discord.js";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";

const event: IBotEvent = {
	name: "interactionCreate",
	loadMsg: `👀 Module: 📨 ${__filename} loaded`,
	execute: async (interaction: Interaction) => {
		// Slash commands events
		if (interaction.isChatInputCommand()) {
			let command = interaction.client.slashCommands.get(interaction.commandName);
			let cooldown = interaction.client.cooldowns.get(`${interaction.commandName}-${interaction.user.username}`);
			if (!command) return;

			if (command.cooldown && cooldown) {
				if (Date.now() < cooldown) {
					interaction.reply(`You have to wait ${Math.floor(Math.abs(Date.now() - cooldown) / 1000)} second(s) to use this command again.`);
					setTimeout(() => interaction.deleteReply(), 5000);
					return;
				}
				interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000);
				setTimeout(() => {
					interaction.client.cooldowns.delete(`${interaction.commandName}-${interaction.user.username}`);
				}, command.cooldown * 1000);
			} else if (command.cooldown && !cooldown) {
				interaction.client.cooldowns.set(`${interaction.commandName}-${interaction.user.username}`, Date.now() + command.cooldown * 1000);
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				logger.error(`error executing command ${interaction.commandName}: ${error}`);
			}
		}
		// Auto complete events
		else if (interaction.isAutocomplete()) {
			const command = interaction.client.slashCommands.get(interaction.commandName);
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			try {
				if (!command.autocomplete) return;
				command.autocomplete(interaction);
			} catch (error) {
				logger.error(`error executing auto complete on command ${interaction.commandName}: ${error}`);
			}
		}
		// Button events
		// its a bit dumb because the only way too pass data is through the custom id, maybe we can use some sort of queue system but too tedious
		else if (interaction.isButton()) {
			let command = interaction.client.buttonCommands.get(interaction.customId.split("-")[0]); // real id is the first part of the custom id
			let cooldown = interaction.client.cooldowns.get(`${interaction.customId}-${interaction.user.username}`);
			if (!command) return;
			if (command.guildOnly && !interaction.guild) {
				interaction.reply("I can't execute that command inside DMs!");
				setTimeout(() => interaction.deleteReply(), 5000);
				return;
			}

			if (command.cooldown && cooldown) {
				if (Date.now() < cooldown) {
					interaction.reply(`You have to wait ${Math.floor(Math.abs(Date.now() - cooldown) / 1000)} second(s) to use this command again.`);
					setTimeout(() => interaction.deleteReply(), 5000);
					return;
				}
				interaction.client.cooldowns.set(`${interaction.customId}-${interaction.user.username}`, Date.now() + command.cooldown * 1000);
				setTimeout(() => {
					interaction.client.cooldowns.delete(`${interaction.customId}-${interaction.user.username}`);
				}, command.cooldown * 1000);
			} else if (command.cooldown && !cooldown) {
				interaction.client.cooldowns.set(`${interaction.customId}-${interaction.user.username}`, Date.now() + command.cooldown * 1000);
			}

			try {
				await command.execute(interaction, interaction.customId.split("-")[1]);
			} catch (error) {
				logger.error(`error executing button command ${interaction.customId}: ${error}`);
			}
		}
	},
};

export default event;
