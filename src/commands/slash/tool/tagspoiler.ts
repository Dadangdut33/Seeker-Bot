import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("tagspoiler")
		.setDescription("Gives spoiler warning by reminding people that the text above is full of spoiler")
		.addStringOption((option) => option.setName("args").setDescription("Description")),
	cooldown: 30,
	execute: async (interaction) => {
		const args = interaction.options.getString("args")!;

		const embed = new EmbedBuilder()
			.setColor("Random")
			.setFooter({ text: args.length > 0 ? `${args} Spoiler Above!!` : interaction.user.username })
			.setTitle(`SPOILER WARNING!!${args.length > 0 ? `\`${args}\`` : ``} SPOILER ABOVE!!`)
			.setThumbnail("https://cdn.discordapp.com/attachments/653206818759376916/700992854763372584/Misaka_10777.jpg")
			.setDescription(
				"A spoiler is an element of a disseminated summary or description of any piece of fiction that reveals any plot elements which threaten to give away important details. Typically, the details of the conclusion of the plot, including the climax and ending, are especially regarded as spoiler material. It can also be used to refer to any piece of information regarding any part of a given media that a potential consumer would not want to know beforehand. Because enjoyment of fiction depends a great deal upon the suspense of revealing plot details through standard narrative progression, the prior revelation of how things will turn out can ''spoil'' the enjoyment that some consumers of the narrative would otherwise have experienced. -wikipedia.org"
			)
			.addFields({
				name: "Spoiler (Bahasa Indonesia: Beberan)",
				value:
					"Adalah tulisan atau keterangan mengenai suatu cerita, yang membeberkan jalan cerita tersebut. Membaca beberan dari suatu cerita dapat menyebabkan berkurangnya kesenangan membaca cerita itu, karena kesenangan membaca sebuah cerita biasanya tergantung kepada dramatisasi atau ketegangan yang ditimbulkan oleh cerita tersebut. Biasanya dalam media massa maupun Internet, beberan disembunyikan dengan cara tertentu, sehingga hanya terbaca oleh yang ingin melihat beberan tersebut. -wikipedia.org",
			})
			.setImage("https://cdn.discordapp.com/attachments/651015913080094724/700999319326556171/1456118167-bcaf5c2f41b07564f965bfb17b16a0e2.png")
			.setTimestamp();

		return interaction.reply({
			content: `Thanks ${interaction.user} \n\n\n**${args.length > 0 ? `\`${args}\` ` : ``}SPOILER** ABOVE!!!\n\n\nScroll up at your own risk`,
			embeds: [embed],
		});
	},
};

export default slashCommands;
