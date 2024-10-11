import { ICommand } from "@/types";

const command: ICommand = {
	name: "ping",
	description: "Check bot's ping",
	execute: async (message, args) => {
		const msg = await message.channel.send("Pinging...");
		msg.edit(`🏓 Pong!\nLatency: \`${Date.now() - message.createdTimestamp}ms\`\nAPI Latency: \`${Math.round(message.client.ws.ping)}ms\``);
	},
	aliases: [],
	permissions: [],
};

export default command;
