import { Guild } from "discord.js";
import { GuildModel } from "../../schemas/Guild";
import { IBotEvent } from "../../types";

const event: IBotEvent = {
	name: "guildCreate",
	loadMsg: `👀 Module: 📨 ${__filename} event loaded | Will save new guild to bot's DB`,
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
