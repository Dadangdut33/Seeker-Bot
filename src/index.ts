import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import { ICommand, ISlashCommand, IButtonCommand, IMusicPlayer } from "./types";
import { readdirSync } from "fs";
import { join } from "path";
import { logger } from "./logger";
import { ServerConfigType } from "./utils/db/schema";
import { env } from "./env";

// ------------------------------ //
(async () => {
	logger.info(`🚀 Starting with ENV: ${env}`);
	// Create client with all the configs and store custom properties
	const client = new Client({
		intents: Object.keys(GatewayIntentBits).map((a) => {
			// @ts-ignore
			return GatewayIntentBits[a];
		}),
		partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction], // cache partials
		allowedMentions: { parse: ["users", "roles"], repliedUser: true },
	});
	client.commands = new Collection<string, ICommand>();
	client.slashCommands = new Collection<string, ISlashCommand>();
	client.buttonCommands = new Collection<string, IButtonCommand>();
	client.guildPreferences = new Collection<string, ServerConfigType>();
	client.cooldowns = new Collection<string, number>();
	client.musicPlayers = new Collection<string, IMusicPlayer>();

	// Load client handlers
	const handlersDir = join(__dirname, "./handlers");
	const handlers = readdirSync(handlersDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
	handlers.forEach(async (handler) => {
		logger.info("⌛ Loading handler", handler);
		require(`${handlersDir}/${handler}`)(client);
	});

	// ------------------------------ //
	// Login
	client.login(process.env.TOKEN);
})();
