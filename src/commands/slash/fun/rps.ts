import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ComponentType } from "discord.js";
import { ISlashCommand } from "@/types";
const chooseArr = ["🗻", "✂", "📰"];

function getResult(me: any, clientChosen: string) {
	if ((me === "🗻" && clientChosen === "✂") || (me === "📰" && clientChosen === "🗻") || (me === "✂" && clientChosen === "📰")) {
		return "You won!";
	} else if (me === clientChosen) {
		return "It's a tie!";
	} else {
		return "You lost!";
	}
}

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder().setName("rps").setDescription("Play rock paper scissors with the bot"),

	execute: async (interaction) => {
		const embed = new EmbedBuilder()
			.setColor("Random")
			.setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
			.setDescription("Add a reaction to one of these emojis to play the game!");

		// btns
		const btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("🗻").setLabel("🗻").setStyle(1),
			new ButtonBuilder().setCustomId("✂").setLabel("✂").setStyle(2),
			new ButtonBuilder().setCustomId("📰").setLabel("📰").setStyle(3)
		);

		await interaction.deferReply({ fetchReply: true });
		const chooseEmojiMsg = await interaction.editReply({ embeds: [embed], components: [btns] }); // Send embed in await
		const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)]; // Get bot reaction
		const collector = chooseEmojiMsg.createMessageComponentCollector({
			filter: (args) => args.user.id == interaction.user.id,
			componentType: ComponentType.Button,
			time: 30000,
		});

		collector.on("collect", async (i) => {
			const reacted = i.customId;
			const result = getResult(reacted, botChoice); // Get result from emojis and bot
			interaction.editReply({ embeds: [new EmbedBuilder().setFields([{ name: result, value: `${reacted} vs ${botChoice}` }])], components: [] });
			collector.stop();
		});

		collector.on("end", async (collected, reason) => {
			if (reason === "time")
				interaction.editReply({
					embeds: [new EmbedBuilder().setTitle(`Game Aborted!`).setDescription(`User did not choose any emojis, so the game is aborted`)],
					components: [],
				});
		});
	},
};

export default slashCommands;
