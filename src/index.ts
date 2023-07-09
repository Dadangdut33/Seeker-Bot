import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import { ICommand, ISlashCommand, IGuild, IButtonCommand, IMusicPlayer } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
import { connect_db } from "./utils/db";
import { logger } from "./logger";

// ------------------------------ //
config(); // load and check .env
if (!process.env.PREFIX) throw new Error("ERROR!!! Prefix is not set | Check your .env");
if (!process.env.TOKEN) throw new Error("ERROR!!! Token is not set | Check your .env");
if (!process.env.MONGO_URI) throw new Error("ERROR!!! MONGO_URI is not set | Check your .env");
if (!process.env.MONGO_DATABASE_NAME) throw new Error("ERROR!!! MONGO_DATABASE_NAME is not set | Check your .env");
if (!process.env.Server_invite) logger.warn("WARNING!!! Server invite is not set | Set it in your .env");
if (!process.env.Mangadex_Username) logger.warn("WARNING!!! Mangadex username is not set | Set it in your .env");
if (!process.env.Mangadex_Password) logger.warn("WARNING!!! Mangadex password is not set | Set it in your .env");
if (!process.env.SAUCENAO_API_KEY) logger.warn("WARNING!!! SauceNao API key is not set | Set it in your .env");

(async () => {
	await connect_db();

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
	client.guildPreferences = new Collection<string, IGuild>();
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
