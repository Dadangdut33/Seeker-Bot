import { Client } from "discord.js";
import { IGuild } from "../types";
import { logger } from "../logger";
import { find_model, insert_model, deleteOne_model } from "../utils/db";
import { GuildModel } from "../schemas";

/**
 * @description
 * This handler map all the guilds the bot is connected to and store them in a database if they are not already stored.
 * This is useful for the preference system.
 */
module.exports = async (client: Client) => {
	logger.info("⚙️ Loading guilds preferences...");
	const current_guilds_id_list = client.guilds.cache.map((guild) => guild.id);
	const fetched_from_db = (await find_model(GuildModel, {})) as IGuild[];
	fetched_from_db.forEach((res) => {
		client.guildPreferences.set(res.guildID, res);
	});

	logger.debug(`📥 Fetched ${current_guilds_id_list.length} guilds from cache`);
	logger.debug(current_guilds_id_list);
	logger.debug(`📥 Fetched ${fetched_from_db.length} guilds preferences from db`);
	logger.debug(fetched_from_db);

	// clean db from guilds that are not in the cache (might be because of bot is kicked from the guild)
	logger.info("🧹 Cleaning guilds preferences... (if any)");
	fetched_from_db.forEach(async (guild) => {
		if (!current_guilds_id_list.includes(guild.guildID)) {
			logger.debug(`🗑️ Guild ${guild.guildID} is not in the cache, deleting from db...`);
			await deleteOne_model(GuildModel, { guildID: guild.guildID }).catch((e) => logger.error(e));

			client.guildPreferences.delete(guild.guildID);
		}
	});

	// add guilds that are not in the db
	logger.info("📥 Adding guilds preferences... (if any)");
	current_guilds_id_list.forEach(async (guildID) => {
		if (!client.guildPreferences.has(guildID)) {
			logger.debug(`📥 Guild ${guildID} is not in the db, adding...`);
			// if not in db
			const joinedAt = client.guilds.cache.get(guildID)?.joinedAt || new Date();
			const new_guild: IGuild = {
				guildID: guildID,
				joinedAt: joinedAt,
				options: {
					prefix: process.env.PREFIX,
				},
			};

			await insert_model(GuildModel, new_guild).catch((e) => logger.error(e));
			client.guildPreferences.set(guildID, new_guild);
		}
	});
};
