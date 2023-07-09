import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import { randomPuppy } from "../../../utils/commands";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("animeme").setDescription("Sends funny anime meme from reddit"),

	execute: async (interaction) => {
		await interaction.deferReply();
		const subReddits = ["goodanimemes", "HistoryAnimemes", "okbuddybaka"];
		const random = subReddits[Math.floor(Math.random() * subReddits.length)];

		let succes = true;
		const img = await randomPuppy(random).catch(async (e) => {
			await interaction.editReply(`Can't reached the subreddit, please try again\nDetails: \`\`\`js\n${e}\`\`\``);

			succes = false;
		});

		if (!succes) return;

		const embed = new EmbedBuilder() //
			.setColor("Random")
			.setImage(img)
			.setTitle(`/r/${random}`)
			.setURL(`https://reddit.com/r/${random}`);

		await interaction.editReply({ content: "", embeds: [embed] });
	},
};

export default slashCommands;
