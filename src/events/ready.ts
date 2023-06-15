import { Client } from "discord.js";
import { BotEvent } from "../types";
import { logColor } from "../utils/helper";
import { logger } from "../logger";

const event: BotEvent = {
	name: "ready",
	once: true,
	execute: (client: Client) => {
		logger.info(logColor("text", `💪 Logged in as ${logColor("variable", client.user?.tag)}`));
	},
};

export default event;
