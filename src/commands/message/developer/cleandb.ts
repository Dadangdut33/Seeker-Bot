import { logger } from "../../../logger";
import { GuildModel } from "../../../schemas/Guild";
import { ICommand, IGuild } from "../../../types";
import { deleteOne_model, find_model } from "../../../utils/db";

const command: ICommand = {
	name: "cleandb",
	aliases: [],
	description: "Clean the guilds database",
	execute: async (message, args) => {
		// user id must be developer id
		if (message.author.id !== "311740375716986881") return;

		const current_guilds_id_list = message.client.guilds.cache.map((guild) => guild.id);
		const fetched_from_db = (await find_model(GuildModel, {})) as IGuild[];

		// clean db from guilds that are not in the cache (might be because of bot is kicked from the guild)
		logger.info("🧹 Cleaning guilds preferences... (if any)");
		const msg = await message.channel.send("Cleaning guilds preferences... (if any)");
		fetched_from_db.forEach(async (guild) => {
			if (!current_guilds_id_list.includes(guild.guildID)) {
				logger.debug(`🗑️ Guild ${guild.guildID} is not in the cache, deleting from db...`);
				await deleteOne_model(GuildModel, { guildID: guild.guildID }).catch((e) => logger.error(e));

				message.client.guildPreferences.delete(guild.guildID);
			}
		});

		msg.edit("Done!");
	},
	permissions: ["Administrator"],
};

export default command;
