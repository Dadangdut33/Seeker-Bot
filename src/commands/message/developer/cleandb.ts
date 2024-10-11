import { db } from "@/utils/db";
import { logger } from "@/logger";
import { ICommand } from "@/types";
import { ServerConfig } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

const command: ICommand = {
	name: "cleandb",
	aliases: [],
	description: "Clean the guilds database",
	execute: async (message, args) => {
		// user id must be developer id
		if (message.author.id !== "311740375716986881") return;

		const current_guilds_id_list = message.client.guilds.cache.map((guild) => guild.id);
		// const fetched_from_db = (await find_model(GuildModel, {})) as IGuild[];
		const fetched = await db.query.ServerConfig.findMany();

		// clean db from guilds that are not in the cache (might be because of bot is kicked from the guild)
		logger.info("🧹 Cleaning guilds preferences... (if any)");
		const msg = await message.channel.send("Cleaning guilds preferences... (if any)");
		fetched.forEach(async (guild) => {
			if (!current_guilds_id_list.includes(guild.guild_id)) {
				try {
					logger.debug(`🗑️ Guild ${guild.guild_id} is not in the cache, deleting from db...`);
					await db.delete(ServerConfig).where(eq(ServerConfig.guild_id, guild.guild_id));
					message.client.guildPreferences.delete(guild.guild_id);
				} catch (error) {
					logger.error(`🚫 Error while deleting guild ${guild.guild_id} from db: ${error}`);
				}
			}
		});

		msg.edit("Done!");
	},
	permissions: ["Administrator"],
};

export default command;
