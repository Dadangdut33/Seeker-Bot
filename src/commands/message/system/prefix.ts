import { ICommand } from "@/types";
import { db } from "@/utils/db";
import { ServerConfig } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

const command: ICommand = {
	name: "prefix",
	description: "Change the prefix of the bot in the current guild",
	execute: async (message, args) => {
		let prefix = args[1];
		if (!prefix) return message.channel.send("No prefix provided");
		if (!message.guild) return;
		const joinedAt = message.client.guilds.cache.get(message.guild.id)?.joinedAt || new Date();
		await db.update(ServerConfig).set({ options: { prefix } }).where(eq(ServerConfig.guild_id, message.guild.id));
		message.client.guildPreferences.set(message.guild.id, { guild_id: message.guild.id, options: { prefix }, joined_at: joinedAt });
		message.channel.send("Prefix successfully changed!");
	},
	permissions: ["Administrator"],
	aliases: ["cp"],
};

export default command;
