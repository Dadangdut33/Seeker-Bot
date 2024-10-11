import { Client } from "discord.js";
import { IBotEvent } from "@/types";
import { logger } from "@/logger";
import { db } from "@/utils/db";
import { ServerConfig, ServerConfigType } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

/**
 * @description
 * This core events map all the guilds the bot is connected to and store them in a database if they are not already stored.
 * This is useful for the preference system.
 */
const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ⚙️ ${__filename} events loaded! | Storing guild preferences...`,
	execute: async (client: Client) => {
		try {
			logger.info("⚙️ Loading guilds preferences...");
			const current_guilds_id_list = client.guilds.cache.map((guild) => guild.id);
			// const fetched_from_db = (await find_model(GuildModel, {})) as IGuild[];
			const fetched_from_db = await db.query.ServerConfig.findMany();
			fetched_from_db.forEach((res) => {
				client.guildPreferences.set(res.guild_id, res);
			});

			logger.debug(`📥 Fetched ${current_guilds_id_list.length} guilds from cache`);
			logger.debug(`📥 Fetched ${fetched_from_db.length} guilds preferences from db`);

			// clean db from guilds that are not in the cache (might be because of bot is kicked from the guild)
			logger.info("🧹 Cleaning guilds preferences... (if any)");
			fetched_from_db.forEach(async (guild) => {
				if (!current_guilds_id_list.includes(guild.guild_id)) {
					logger.debug(`🗑️ Guild ${guild.guild_id} is not in the cache, deleting from db...`);
					await db.delete(ServerConfig).where(eq(ServerConfig.guild_id, guild.guild_id));
				}
			});
			logger.info("🧹 Done!");

			// add guilds that are not in the db
			logger.info("📥 Adding guilds preferences... (if any)");
			current_guilds_id_list.forEach(async (guildID) => {
				if (!client.guildPreferences.has(guildID)) {
					logger.debug(`📥 Guild ${guildID} is not in the db, adding...`);
					// if not in db
					const joinedAt = client.guilds.cache.get(guildID)?.joinedAt || new Date();
					const new_guild: ServerConfigType = {
						guild_id: guildID,
						joined_at: joinedAt,
						options: {
							prefix: process.env.PREFIX,
						},
					};

					// await insert_model(GuildModel, new_guild).catch((e) => logger.error(e));
					await db.insert(ServerConfig).values(new_guild);
					client.guildPreferences.set(guildID, new_guild);
				}
			});
			logger.info("📥 Done!");
		} catch (error) {
			logger.error(`error loading guild preference: ${error}`);
		}
	},
};

export default event;
