import { SlashCommandBuilder, CommandInteraction, Collection, PermissionResolvable, Message, AutocompleteInteraction } from "discord.js";
import mongoose from "mongoose";

export interface ISlashCommand {
	command: SlashCommandBuilder | any;
	execute: (interaction: CommandInteraction) => void;
	autocomplete?: (interaction: AutocompleteInteraction) => void;
	cooldown?: number; // in seconds
	disabled?: boolean;
}

export interface ICommand {
	name: string;
	description: string;
	execute: (message: Message, args: Array<string>) => void;
	permissions: Array<PermissionResolvable>;
	aliases: Array<string>;
	cooldown?: number;
	disabled?: boolean;
}

export interface IBotEvent {
	name: string;
	loadMsg?: string;
	once?: boolean | false;
	execute: (...args) => void;
	disabled?: boolean;
}

interface IGuildOptions {
	prefix: string;
}

export interface IGuild {
	guildID: string;
	options: GuildOptions;
	joinedAt?: Date;
}

export type TGuildOption = keyof IGuildOptions;

export interface IGuildMongo extends mongoose.Document {}

export interface AuditWatch_I {
	guildID: string;
	outputChName: string;
}

export interface IAuditWatchMongo extends mongoose.Document {}

export interface IanyDB {
	[key: string]: any;
}

// ------------------ Global ------------------
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			CLIENT_ID: string;
			PREFIX: string;
			MONGO_URI: string;
			MONGO_DATABASE_NAME: string;
		}
	}
}

declare module "discord.js" {
	export interface Client {
		slashCommands: Collection<string, ISlashCommand>;
		commands: Collection<string, ICommand>;
		cooldowns: Collection<string, number>;
		guildPreferences: Collection<string, IGuild>;
	}
}
