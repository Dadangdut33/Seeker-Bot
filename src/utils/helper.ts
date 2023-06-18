import { GuildMember, PermissionFlagsBits, PermissionResolvable, TextChannel, Guild } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import moment from "moment-timezone";
import { prettyMilliseconds } from "./locallib/prettyms";
import { consoleColorType, CONSOLE_COLORS } from "./constants";

export const logColor = (color: consoleColorType, message: any) => {
	return chalk.hex(CONSOLE_COLORS[color])(message);
};

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
	let neededPermissions: PermissionResolvable[] = [];
	permissions.forEach((permission) => {
		if (!member.permissions.has(permission)) neededPermissions.push(permission);
	});
	if (neededPermissions.length === 0) return null;
	return neededPermissions.map((p) => {
		if (typeof p === "string") return p.split(/(?=[A-Z])/).join(" ");
		else
			return Object.keys(PermissionFlagsBits)
				.find((k) => Object(PermissionFlagsBits)[k] === p)
				?.split(/(?=[A-Z])/)
				.join(" ");
	});
};

export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
	channel.send(message).then((m) => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration));
	return;
};

export const walkdir = (directory: string): string[] => {
	return readdirSync(directory, { withFileTypes: true }).flatMap((file) => (file.isDirectory() ? walkdir(join(directory, file.name)) : join(directory, file.name)));
};

export const toTitleCase = (str: string) => {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
};

export const getEmoji = (guild: Guild) => {
	return guild.emojis.cache.map((emojis) => {
		return emojis;
	});
};

export const OnlineUsers = (guild: Guild) => {
	let totalMemberInGuild = guild.memberCount,
		offline = guild.members.cache.filter((m) => !m.presence).size;

	return totalMemberInGuild - offline;
};

export const totalBots = (guild: Guild) => {
	let bots = guild.members.cache.filter((m) => m.user.bot).size;

	return bots;
};

export const getMemberNewest = (guild: Guild) => {
	let index = 0;

	return guild.members.cache
		.sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!)
		.map((GuildMember) => {
			let age = moment().tz("Asia/Jakarta").valueOf() - GuildMember.joinedAt!.getTime();
			index++;
			return `${index}. <t:${~~(moment(GuildMember.joinedAt).tz("Asia/Jakarta").valueOf() / 1000)}:R> <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
		});
};

export const getMemberOldest = (guild: Guild) => {
	let index = 0;

	return guild.members.cache
		.sort((a, b) => b.joinedTimestamp! - a.joinedTimestamp!)
		.map((GuildMember) => {
			let age = moment().tz("Asia/Jakarta").valueOf() - GuildMember.joinedAt!.getTime();
			index++;
			return `${index}. <t:${~~(moment(GuildMember.joinedAt).tz("Asia/Jakarta").valueOf() / 1000)}:R> <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
		});
};
