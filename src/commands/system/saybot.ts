import { ICommand } from "../../types";

const command: ICommand = {
	name: "saybot",
	description: "Make the bot say your message",
	execute: (message, args) => {
		if (!args.length) return message.channel.send("No message provided");
		// delete user message
		message.channel.send(args.slice(1).join(" "));
		message.delete();
	},
	permissions: ["Administrator"],
	aliases: ["say"],
};

export default command;
