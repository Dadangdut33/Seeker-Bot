import { Client } from "discord.js";
import { EVENTS_DIR, logColor, walkdir } from "../utils";
import { IBotEvent } from "../types";
import { logger } from "../logger";

module.exports = (client: Client) => {
	let counter = 0;

	logger.info(logColor("text", `🔥 Loading events...`));
	walkdir(EVENTS_DIR).forEach((file) => {
		if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
		let event: IBotEvent = require(file).default;
		if (event.disabled) return; // check disabled
		if (event.loadMsg) logger.info(event.loadMsg);

		// create event listener with each args destructured depending on the event
		event.once ? client.once(event.name, (...args) => event.execute(...args)) : client.on(event.name, (...args) => event.execute(...args));

		counter++;
	});

	logger.info(logColor("text", `🌠 Successfully loaded ${logColor("variable", counter)} events`));
};
