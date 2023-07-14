import { SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../../types";
import {
	pause,
	play,
	seek,
	skip,
	stop,
	unpause,
	auto,
	clear,
	forward,
	rewind,
	remove,
	join,
	leave,
	loop,
	lyrics,
	nowPlaying,
	move,
	queue,
} from "../../../utils/commands/music";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("music")
		.setDescription("Music commands through youtube video or live stream")
		.addSubcommand((subcommand) => subcommand.setName("pause").setDescription("Pause the current playing audio"))
		.addSubcommand((subcommand) => subcommand.setName("unpause").setDescription("Resume the current paused audio"))
		.addSubcommand((subcommand) => subcommand.setName("stop").setDescription("Stop the current playing audio"))
		.addSubcommand((subcommand) => subcommand.setName("skip").setDescription("Skip the current playing audio"))
		.addSubcommand((subcommand) => subcommand.setName("join").setDescription("Join the voice channel of the user who invoked the command"))
		.addSubcommand((subcommand) => subcommand.setName("leave").setDescription("Leave the voice channel"))
		.addSubcommand((subcommand) => subcommand.setName("auto").setDescription("Toggle autoplay of the youtube player"))
		.addSubcommand((subcommand) => subcommand.setName("move").setDescription("Move the bot to the voice channel of the user who invoked the command"))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("play")
				.setDescription("Play a yt video/live stream with query/link")
				.addStringOption((option) => option.setName("query").setDescription("Search query or link to play").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand // sub sub -> radio
				.setName("radio")
				.setDescription("Play a predefined radio")
				.addStringOption((option) =>
					option
						.setName("radio")
						.setDescription("Predefined radio to play")
						.setRequired(true)
						.addChoices(
							{ name: "quran-live-mecca", value: "https://www.youtube.com/watch?v=UtvBCFyq2eI" },
							{ name: "lofi-study", value: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
							{ name: "lofi-game", value: "https://www.youtube.com/watch?v=4xDzrJKXOOY" }
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("seek")
				.setDescription("Seek the current playing audio")
				.addStringOption((option) => option.setName("time").setDescription("Time to seek to. Format: hh:mm:ss or mm:ss or ss").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("forward")
				.setDescription("Forward the current playing audio")
				.addIntegerOption((option) => option.setName("seconds").setDescription("Seconds to forward").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("rewind")
				.setDescription("Rewind the current playing audio")
				.addIntegerOption((option) => option.setName("seconds").setDescription("Seconds to rewind").setRequired(true))
		)
		.addSubcommand((subcommand) => subcommand.setName("now-playing").setDescription("Show the current playing audio"))
		.addSubcommand((subcommand) => subcommand.setName("loop").setDescription("Toggle looping of the current queue"))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("lyrics")
				.setDescription("Get lyrics of currently played song or from input")
				.addStringOption((option) => option.setName("query").setDescription("Query to search").setRequired(false).setMinLength(1))
				.addBooleanOption((option) => option.setName("no-picking").setDescription("Show the lyrics without a prompt to choose the query result").setRequired(false))
		)
		.addSubcommand((subcommand) => subcommand.setName("queue").setDescription("Show the current queue"))
		.addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear the current queue"))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Remove a song from queue")
				.addIntegerOption((option) => option.setName("index").setDescription("Index of the song to remove").setRequired(true).setMinValue(1))
		),

	execute: async (interaction) => {
		await interaction.deferReply();
		const command = interaction.options.getSubcommand();

		switch (command) {
			case "play":
				play(interaction, false);
				break;
			case "radio":
				play(interaction, true);
				break;
			case "pause":
				pause(interaction);
				break;
			case "unpause":
				unpause(interaction);
				break;
			case "stop":
				stop(interaction);
				break;
			case "skip":
				skip(interaction);
				break;
			case "seek":
				seek(interaction);
				break;
			case "forward":
				forward(interaction);
				break;
			case "rewind":
				rewind(interaction);
				break;
			case "now-playing":
				nowPlaying(interaction);
				break;
			case "loop":
				loop(interaction);
				break;
			case "lyrics":
				lyrics(interaction);
				break;
			case "queue":
				queue(interaction);
				break;
			case "clear":
				clear(interaction);
				break;
			case "remove":
				remove(interaction);
				break;
			case "join":
				join(interaction);
				break;
			case "leave":
				leave(interaction);
				break;
			case "move":
				move(interaction);
				break;
			case "auto":
				auto(interaction);
				break;
			default:
				interaction.editReply("This should not happen");
				break;
		}
	},
};

export default slashCommands;
