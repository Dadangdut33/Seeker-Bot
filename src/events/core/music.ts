import { Client } from "discord.js";
import { IBotEvent } from "../../types";
import { registerPlayers } from "../../utils/commands/music";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: 📨 ${__filename} loaded`,
	execute: async (client: Client) => {
		await registerPlayers(client);
	},
};

export default event;
