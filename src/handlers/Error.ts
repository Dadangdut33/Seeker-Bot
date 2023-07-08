import { Client } from "discord.js";
import { logger } from "../logger";

module.exports = (client: Client) => {
	process.on("unhandledRejection", async (reason, promise) => {
		logger.error(`[Anti-crash] Unhandled promise rejection: ${reason} at ${promise}`);
	});

	process.on("uncaughtException", (error) => {
		logger.error(`[Anti-crash] Uncaught exception/catch: ${error}`);
	});

	process.on("uncaughtExceptionMonitor", (error, origin) => {
		logger.warn(`[Anti-crash] Uncaught exception/catch (monitor): ${error} ${origin}`);
	});
};
