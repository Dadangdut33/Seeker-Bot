import { Client } from "discord.js";
import { BotEvent } from "../types";
import { logColor } from "../utils/helper";
import { activity } from "../utils/events/activity";
import { logger } from "../logger";

function changeActivity(client: Client) {
	const rand = Math.floor(Math.random() * activity.length);
	client.user?.setPresence({
		activities: [{ name: `${activity[rand].desc}`, type: activity[rand].type as any }],
	});
}

const event: BotEvent = {
	name: "ready",
	once: true,
	execute: (client: Client) => {
		logger.info(logColor("text", `💪 Logged in as ${logColor("variable", client.user?.tag)}`));

		// Status and presence at start
		client.user?.setStatus("online");
		changeActivity(client);
		setInterval(() => changeActivity(client), 1000 * 60 * 15); // 15 minutes
	},
};

export default event;
