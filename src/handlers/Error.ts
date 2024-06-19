import { Client } from "discord.js";
import { logger } from "../logger";

module.exports = (client: Client) => {
	process.on("unhandledRejection", async (reason, promise) => {
		logger.error(`[Anti-crash] Unhandled promise rejection: ${reason} | ${promise}`);
	});

	process.on("uncaughtException", (e) => {
		logger.error(`[Anti-crash] Uncaught exception/catch: ${e}`);
		logger.error(`${e.stack}`);
	});

	process.on("uncaughtExceptionMonitor", (e, origin) => {
		logger.warn(`[Anti-crash] Uncaught exception/catch (monitor): ${e} ${origin}`);
		logger.warn(`${e.stack}`);
	});

	process.on("warning", (e) => {
		logger.warn(`Warning: ${e.message}`);
		logger.warn(`${e.stack}`);
	});
};
