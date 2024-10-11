import { Guild } from "discord.js";
import { IBotEvent } from "@/types";
import { logger } from "@/logger";
import { db } from "@/utils";
import { ServerConfig } from "@/utils/db/schema";

const event: IBotEvent = {
	name: "guildCreate",
	loadMsg: `👀 Module: 📨 ${__filename} event loaded | Will save new guild to bot's DB`,
	execute: async (guild: Guild) => {
		try {
			logger.info(`Joined guild ${guild.name} (${guild.id})`);
			await db.insert(ServerConfig).values({ guild_id: guild.id });
			logger.info(`Saved guild ${guild.name} (${guild.id}) to DB`);
		} catch (error) {
			// catch stuff like dupe key or other errors
			logger.error(`error saving guild ${guild.name} (${guild.id}) to DB: ${error}`);
		}
	},
};

export default event;
