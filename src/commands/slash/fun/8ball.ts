import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";

const responses = [
	"it is certain",
	"it is decidedly so",
	"without a doubt",
	"yes — definitely",
	"you may rely on it",
	"as I see it, yes",
	"most likely",
	"outlook good",
	"yes",
	"signs point to yes",
	"reply hazy, try again",
	"ask again later",
	"better not tell you now",
	"cannot predict now",
	"concentrate and ask again",
	"don't count on it",
	"my reply is no",
	"my sources say no",
	"outlook not so good",
	"very doubtful",
	"Iya silakan",
	"Monggo",
	"ora",
	"Jangan",
	"Gasken banh",
	"Mungkin",
	"Tidak",
	"YNTKTS",
];

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("8ball")
		.setDescription("Ask the magic 8ball")
		.addStringOption((option) => option.setName("question").setDescription("Your question")),

	execute: async (interaction) => {
		const responseGet = responses[Math.floor(Math.random() * responses.length)];

		return interaction.reply({ content: `:8ball: | ${responseGet} **${interaction.user.toString()}**`, allowedMentions: { repliedUser: false } });
	},
};

export default slashCommands;
