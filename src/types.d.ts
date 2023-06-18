import {
	SlashCommandBuilder,
	CommandInteraction,
	Collection,
	PermissionResolvable,
	Message,
	AutocompleteInteraction,
	Interaction,
	ClientEvents,
	ButtonInteraction,
} from "discord.js";
import { Document } from "mongoose";

// ------------------ Bot - DB ------------------
export interface ICommand {
	name: string;
	description: string;
	execute: (message: Message, args: Array<string>) => void;
	permissions: Array<PermissionResolvable>;
	aliases: Array<string>;
	cooldown?: number;
	disabled?: boolean;
}

export interface ISlashCommand {
	command: SlashCommandBuilder | any;
	execute: (interaction: CommandInteraction) => void;
	guildOnly?: boolean;
	autocomplete?: (interaction: AutocompleteInteraction) => void;
	cooldown?: number; // in seconds
	disabled?: boolean;
}

export interface IButtonCommand {
	id: string; // name is the id
	execute: (interaction: ButtonInteraction, args: any) => void;
	guildOnly?: boolean;
	cooldown?: number;
	disabled?: boolean;
}

export interface IBotEvent {
	name: keyof ClientEvents;
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

export interface IGuildMongo extends Document {}

export interface AuditWatch_I {
	guildID: string;
	outputChName: string;
}

export interface IAuditWatchMongo extends Document {}

export interface IanyDB {
	[key: string]: any;
}
// ------------------ Events ------------------
// Quran.com API
export interface IQuranComTranslation {
	text: string;
	language_name: string;
}

export interface IQuranComVerseWords {
	id: number;
	position: number;
	audio_url: string;
	char_type_name: string;
	code_v1: string;
	page_number: number;
	line_number: number;
	text: string;
	translation: IQuranComTranslation;
	transliteration: IQuranComTranslation;
}

export interface IQuranComVerse {
	id: number;
	verse_number: number;
	verse_key: string;
	hizb_number: number;
	rub_el_hizb_number: number;
	ruku_number: number;
	manzil_number: number;
	sajdah_number: number;
	page_number: number;
	juz_number: number;
	words: IQuranComVerseWords[];
}

export interface IQuranComPages {
	[page: number]: number;
}

export interface IQuranComChapterTranslatedName {
	language_name: string;
	name: string;
}

export interface IQuranComChapter {
	id: number;
	revelation_place: string;
	revelation_order: number;
	bismillah_pre: boolean;
	name_simple: string;
	name_complex: string;
	name_arabic: string;
	verses_count: number;
	pages: IQuranComPages[];
}

// equran.id

// audio is like this
/**
 * {
 * "01": "....",
 * "02": "....",
 * "03": "....",
 * "04": "....",
 * "05": "....",
 * }
 * */
export interface IEquranIdAudio {
	[key: string]: string;
}

export interface IEquranIdAyat {
	nomorAyat: number;
	teksArab: string;
	teksLatin: string;
	teksIndonesia: string;
	audio: IEquranIdAudio;
}

export interface IEquranIdTafsir {
	ayat: number;
	teks: string;
}

export interface IEquranIdNextPrev {
	nomor: number;
	nama: string;
	namaLatin: string;
	jumlahAyat: number;
}

export interface IEquranIdSurah {
	nomor: number;
	nama: string;
	namaLatin: string;
	jumlahAyat: number;
	tempatTurun: string;
	arti: string;
	deskripsi: string;
	audioFull: IEquranIdAudio;
	ayat: IEquranIdAyat[];
	suratSelanjutnya: IEquranIdNextPrev;
	suratSebelumnya: IEquranIdNextPrev;
}

export interface IEquranIdSurahTafsir {
	nomor: number;
	nama: string;
	namaLatin: string;
	jumlahAyat: number;
	tempatTurun: string;
	arti: string;
	deskripsi: string;
	audioFull: IEquranIdAudio;
	tafsir: IEquranIdTafsir[];
	suratSelanjutnya: IEquranIdNextPrev;
	suratSebelumnya: IEquranIdNextPrev;
}

export interface IEquranIdVerseResponse {
	code: number;
	message: string;
	data: IEquranIdSurah;
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
		buttonCommands: Collection<string, IButtonCommand>;
		cooldowns: Collection<string, number>;
		guildPreferences: Collection<string, IGuild>;
	}
}
