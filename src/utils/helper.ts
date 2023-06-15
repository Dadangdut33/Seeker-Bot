import { GuildMember, PermissionFlagsBits, PermissionResolvable, TextChannel } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
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

export const capitalizeFirstLetter = (myString: string) => {
	return myString.charAt(0).toUpperCase() + myString.slice(1);
};

export const hasNumber = (myString: string) => {
	return /\d/.test(myString);
};

export const reverseString = (str: string) => {
	return str.split("").reverse().join("");
};

export const toTitleCase = (str: string) => {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
};
