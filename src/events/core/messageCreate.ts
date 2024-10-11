import { ChannelType, Message } from "discord.js";
import { checkPermissions, sendTimedMessage } from "@/utils";
import { IBotEvent } from "@/types";
import { crosspost, detectAnimeSearch, detectHaiku, detectMangaSearch } from "@/utils/events/listener";
import { logger } from "@/logger";
import { getGuildOption } from "@/utils/server";

const event: IBotEvent = {
	name: "messageCreate",
	loadMsg: `👀 Module: 📨 ${__filename} loaded | Will handle prefix, cooldowns, crosspost, haiku, facebooklinks, and manga/anime search`,
	execute: async (message: Message) => {
		if (!message.member || message.member.user.bot) return;
		if (!message.guild) return; // Prevent DMs

		const prefix = await getGuildOption(message.client, message.guild, "prefix");

		// Global events that is not related to commands
		if (!message.content.startsWith(prefix)) {
			crosspost(message);
			detectHaiku(message);
			detectMangaSearch(message, prefix);
			detectAnimeSearch(message, prefix);
			return;
		}

		if (message.channel.type !== ChannelType.GuildText) return;

		let args = message.content.substring(prefix.length).split(" ");
		let command = message.client.commands.get(args[0]);

		if (!command) {
			let commandFromAlias = message.client.commands.find((command) => command.aliases.includes(args[0]));
			if (commandFromAlias) command = commandFromAlias;
			else return;
		}

		let cooldown = message.client.cooldowns.get(`${command.name}-${message.member.user.username}`);
		let neededPermissions = checkPermissions(message.member, command.permissions);
		if (neededPermissions !== null)
			return sendTimedMessage(`You don't have enough permissions to use this command.  \n Needed permissions: ${neededPermissions.join(", ")}`, message.channel, 5000);

		if (command.cooldown && cooldown) {
			if (Date.now() < cooldown) {
				sendTimedMessage(`You have to wait ${Math.floor(Math.abs(Date.now() - cooldown) / 1000)} second(s) to use this command again.`, message.channel, 5000);
				return;
			}
			message.client.cooldowns.set(`${command.name}-${message.member.user.username}`, Date.now() + command.cooldown * 1000);
			setTimeout(() => {
				message.client.cooldowns.delete(`${command?.name}-${message.member?.user.username}`);
			}, command.cooldown * 1000);
		} else if (command.cooldown && !cooldown) {
			message.client.cooldowns.set(`${command.name}-${message.member.user.username}`, Date.now() + command.cooldown * 1000);
		}

		try {
			await command.execute(message, args);
		} catch (error) {
			logger.error(`error executing command ${command.name}: ${error}`);
		}
	},
};

export default event;
