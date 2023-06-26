import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import figlet from "figlet";
import { logger } from "../../logger";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("asciify")
		.setDescription("Convert text to ASCII art using")
		.addStringOption((option) => option.setName("text").setDescription("Text to convert").setRequired(true).setMaxLength(2000)),
	execute: async (interaction) => {
		figlet.text(interaction.options.getString("text")!, (error, data) => {
			if (error) {
				interaction.reply({ content: `Something went wrong...\n${error}`, ephemeral: true });
				logger.error(`${error}`);
				return;
			}

			if (data!.length > 2000) return interaction.reply({ content: "The output is too long! Try a shorter input.", ephemeral: true });

			interaction.reply({ content: `\`\`\`${data}\`\`\`` });
		});
	},
};

export default slashCommands;
