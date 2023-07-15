import { ActionRowBuilder, ButtonBuilder, Client, TextChannel } from "discord.js";
import { IBotEvent } from "../../types";
import { CronJob } from "cron";
import { embedRandomAyat } from "../../utils/commands/verse";
import { logger } from "../../logger";

const cronFunc = async (channel: TextChannel) => {
	const data = await embedRandomAyat();
	if (!data) return logger.error("[ERROR] [daily-surah] Failed to get random ayat");

	// Surah number and ayat is in the title of the first embed with format like this [surah:number] xxx (xxx) - xxx
	// get each of it
	const surahNumber = data[0].data.title?.split(" ")[0].split(":")[0].replace("[", ""),
		ayatNumber = data[0].data.title?.split(" ")[0].split(":")[1].replace("]", "");

	// add button to get the tafsir
	const tafsirButton = new ButtonBuilder().setCustomId(`tafsir-${surahNumber}:${ayatNumber}`).setStyle(1).setLabel("Tafsir");
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(tafsirButton);

	channel.send({ embeds: data, components: [row] });
};

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: ${__filename} loaded`,
	disabled: false,
	execute: (client: Client) => {
		{
			const guildID = process.env.PERSONAL_SERVER_ID!,
				channelID = "1129466491960574063";

			const guild = client.guilds.cache.get(guildID);
			if (!guild) return logger.warn("Invalid guild for daily surah");

			let channel = guild.channels.cache.get(channelID) as TextChannel;
			if (!channel) return logger.warn("Invalid channel for daily surah");

			try {
				let scheduledMessages = [
					// This runs every day at 05:00:00
					new CronJob("00 05 * * *", async () => await cronFunc(channel), null, true, "Asia/Jakarta"),
					// This runs every day at 12:00:00
					new CronJob("00 12 * * *", async () => await cronFunc(channel), null, true, "Asia/Jakarta"),
					// This runs every day at 16:00:00
					new CronJob("00 16 * * *", async () => await cronFunc(channel), null, true, "Asia/Jakarta"),
				];

				scheduledMessages.forEach((element) => element.start());
			} catch (e) {
				logger.error(`[ERROR] [daily-surah] ${e}`);
			}
		}
	},
};

export default event;
