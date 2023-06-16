import { Client } from "discord.js";
import { join } from "path";
import { logColor, walkdir } from "../utils";
import { IBotEvent } from "../types";
import { logger } from "../logger";

module.exports = (client: Client) => {
	let eventsDir = join(__dirname, "../events"),
		counter = 0;

	logger.info(logColor("text", `🔥 Loading events...`));
	walkdir(eventsDir).forEach((file) => {
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
