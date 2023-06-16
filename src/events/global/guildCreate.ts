import { Guild } from "discord.js";
import { GuildModel } from "../../schemas/Guild";
import { BotEvent } from "../../types";

const event: BotEvent = {
	name: "guildCreate",
	loadMsg: "📨 GuildCreate event loaded | Will save new guild to bot's DB",
	execute: (guild: Guild) => {
		let newGuild = new GuildModel({
			guildID: guild.id,
			options: {},
			joinedAt: Date.now(),
		});
		newGuild.save();
	},
};

export default event;
