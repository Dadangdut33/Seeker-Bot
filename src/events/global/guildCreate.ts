import { Guild } from "discord.js";
import { GuildModel } from "../../schemas/Guild";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";

const event: IBotEvent = {
	name: "guildCreate",
	loadMsg: `👀 Module: 📨 ${__filename} event loaded | Will save new guild to bot's DB`,
	execute: async (guild: Guild) => {
		try {
			logger.info(`Joined guild ${guild.name} (${guild.id})`);
			let newGuild = new GuildModel({
				guildID: guild.id,
				options: {},
				joinedAt: Date.now(),
			});
			await newGuild.save();
			logger.info(`Saved guild ${guild.name} (${guild.id}) to DB`);
		} catch (error) {
			logger.error(`error saving guild ${guild.name} (${guild.id}) to DB: ${error}`);
		}
	},
};

export default event;
