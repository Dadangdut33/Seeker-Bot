import { setGuildOption } from "../../utils";
import { ICommand } from "../../types";

const command: ICommand = {
	name: "prefix",
	description: "Change the prefix of the bot in the current guild",
	execute: (message, args) => {
		let prefix = args[1];
		if (!prefix) return message.channel.send("No prefix provided");
		if (!message.guild) return;
		const joinedAt = message.client.guilds.cache.get(message.guild.id)?.joinedAt || new Date();
		setGuildOption(message.client, message.guild, "prefix", prefix);
		message.client.guildPreferences.set(message.guild.id, { guildID: message.guild.id, options: prefix, joinedAt });
		message.channel.send("Prefix successfully changed!");
	},
	permissions: ["Administrator"],
	aliases: ["cp"],
};

export default command;
