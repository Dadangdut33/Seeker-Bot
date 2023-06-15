import { SlashCommandBuilder, CommandInteraction, Collection, PermissionResolvable, Message, AutocompleteInteraction } from "discord.js";
import mongoose from "mongoose";

export interface SlashCommand {
	command: SlashCommandBuilder | any;
	execute: (interaction: CommandInteraction) => void;
	autocomplete?: (interaction: AutocompleteInteraction) => void;
	cooldown?: number; // in seconds
	disabled?: boolean;
}

export interface Command {
	name: string;
	execute: (message: Message, args: Array<string>) => void;
	permissions: Array<PermissionResolvable>;
	aliases: Array<string>;
	cooldown?: number;
	disabled?: boolean;
}

export interface BotEvent {
	name: string;
	loadMsg?: string;
	once?: boolean | false;
	execute: (...args) => void;
	disabled?: boolean;
}

interface GuildOptions {
	prefix: string;
}

export interface IGuild {
	guildID: string;
	options: GuildOptions;
	joinedAt: Date;
}

export interface IGuildMongo extends mongoose.Document {}

export interface IAuditWatch {
	guildID: string;
	outputChName: string;
}

export interface IAuditWatchMongo extends mongoose.Document {}

export type GuildOption = keyof GuildOptions;

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
		slashCommands: Collection<string, SlashCommand>;
		commands: Collection<string, Command>;
		cooldowns: Collection<string, number>;
	}
}
