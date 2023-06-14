import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import { Command, SlashCommand } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
import { connect_db } from "./utils/db";

// ------------------------------ //
config(); // load and check .env
if (!process.env.PREFIX) throw new Error("ERROR!!! Prefix is not set | Check your .env");
if (!process.env.TOKEN) throw new Error("ERROR!!! Token is not set | Check your .env");
if (!process.env.MONGO_URI) throw new Error("ERROR!!! MONGO_URI is not set | Check your .env");
if (!process.env.MONGO_DATABASE_NAME) throw new Error("ERROR!!! MONGO_DATABASE_NAME is not set | Check your .env");
if (!process.env.Server_invite) console.warn("WARNING!!! Server invite is not set | Set it in your .env");
if (!process.env.Mangadex_Username) console.warn("WARNING!!! Mangadex username is not set | Set it in your .env");
if (!process.env.Mangadex_Password) console.warn("WARNING!!! Mangadex password is not set | Set it in your .env");
if (!process.env.SAUCENAO_API_KEY) console.warn("WARNING!!! SauceNao API key is not set | Set it in your .env");

(async () => {
	await connect_db();

	// Create client
	const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
		partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction], // cache partials
		allowedMentions: { parse: ["users", "roles"], repliedUser: true },
	});

	// Store Custom Properties to Client
	client.slashCommands = new Collection<string, SlashCommand>();
	client.commands = new Collection<string, Command>();
	client.cooldowns = new Collection<string, number>();

	const handlersDir = join(__dirname, "./handlers");
	const handlers = readdirSync(handlersDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
	handlers.forEach(async (handler) => {
		console.log("⌛ Loading handler", handler);
		require(`${handlersDir}/${handler}`)(client);
	});

	// ------------------------------ //
	// Login
	client.login(process.env.TOKEN);
})();
