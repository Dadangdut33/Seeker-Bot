import { Client, TextChannel } from "discord.js";
import { IBotEvent } from "../../types";
import { CronJob } from "cron";
import { embedRandomAyat } from "../../utils/commands/verse";
import { logger } from "../../logger";

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} loaded`,
	disabled: true,
	execute: (client: Client) => {
		{
			const guildID = process.env.PERSONAL_SERVER_ID!,
				channelID = "1119688966694781009";

			const guild = client.guilds.cache.get(guildID);
			if (!guild) return logger.warn("Invalid guild for daily surah");

			let channel = guild.channels.cache.get(channelID) as TextChannel;
			if (!channel) return logger.warn("Invalid channel for daily surah");

			try {
				let scheduledMessage = new CronJob(
					"30 07 * * *",
					async () => {
						// This runs every day at 07:30:00, you can do anything you want
						const data = await embedRandomAyat();
						if (!data) return logger.error("[ERROR] [daily-surah] Failed to get random ayat");

						channel.send({ embeds: data });
					},
					null,
					true,
					"Asia/Jakarta"
				);

				// When you want to start it, use:
				scheduledMessage.start();
			} catch (e) {
				logger.error(`[ERROR] [daily-surah] ${e}`);
			}
		}
	},
};

export default event;
