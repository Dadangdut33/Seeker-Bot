import { Client, Guild } from "discord.js";
import { KeyOfGuildOptions } from "@/types";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { ServerConfig, ServerConfigType } from "./db/schema";
import { env } from "@/env";

export const setGuildOption = async (client: Client, guild: Guild, option: KeyOfGuildOptions, value: any) => {
	let foundGuild = await db.query.ServerConfig.findFirst({ where: eq(ServerConfig.guild_id, guild.id) });

	if (foundGuild) {
		foundGuild.options[option] = value;
		await db.update(ServerConfig).set({
			options: foundGuild.options,
		});

		client.guildPreferences.set(guild.id, { guild_id: guild.id, options: foundGuild.options, joined_at: foundGuild.joined_at });
		return;
	}

	// Create new guild if not found
	const joinedAt = client.guilds.cache.get(guild.id)?.joinedAt || new Date();
	const newGuild: ServerConfigType = {
		guild_id: guild.id,
		options: {
			prefix: env.PREFIX,
		},
		joined_at: joinedAt,
	};
	newGuild.options[option] = value;
	await db.insert(ServerConfig).values(newGuild); // save to db
	client.guildPreferences.set(guild.id, newGuild); // save to local config
};

export const getGuildOption = async (client: Client, guild: Guild, option: KeyOfGuildOptions) => {
	// get from local config, if not found search in db
	let foundGuild = client.guildPreferences.get(guild.id);
	if (!foundGuild) foundGuild = await db.query.ServerConfig.findFirst({ where: eq(ServerConfig.guild_id, guild.id) });

	// found in db, return the value
	if (foundGuild) return foundGuild.options[option];

	// not found in db, create new guild
	const joinedAt = client.guilds.cache.get(guild.id)?.joinedAt || new Date();
	const newGuild: ServerConfigType = {
		guild_id: guild.id,
		options: {
			prefix: env.PREFIX,
		},
		joined_at: joinedAt,
	};
	await db.insert(ServerConfig).values(newGuild); // save to db
	client.guildPreferences.set(guild.id, newGuild); // save to local config
	return newGuild.options[option];
};
