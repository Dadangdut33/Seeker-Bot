import { IMusicSession } from "../../types";
import { logger } from "../../logger";
import { CacheType, ChatInputCommandInteraction, Client, Guild, TextChannel, GuildMember, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
	find_colname,
	insert_colname,
	updateOne_colname,
	randomDiscordColor,
	fancyTimeFormat,
	btnPrompter,
	convertToEpoch,
	fancyTimeFormatMs,
	interactionBtnPaginator,
} from "../../utils";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import { search, stream } from "play-dl";
import { Client as ytClient, PlaylistCompact, VideoCompact } from "youtubei";
import { getInfo, validateURL, videoInfo } from "ytdl-core";
import Genius from "genius-lyrics";
import { splitBar } from "string-progressbar";
const searchClient = new ytClient();

export const registerPlayerEvent = async (client: Client, guild: Guild) => {
	const mp = client.musicPlayers.get(guild.id)!;

	mp.player.on("stateChange", async () => {
		// verify if idle or stopped
		if (mp.player.state.status !== "idle") return;

		// check bot still in vc or not
		if (!getVoiceConnection(guild.id)) return;

		// get queue data & verify if guild is registered or not
		let queueData = (await find_colname("music_state", { gid: guild.id })) as IMusicSession[];
		if (!queueData || queueData.length === 0) {
			insert_colname("music_state", { gid: guild.id, vc_id: "", tc_id: "", queue: [] });
			return;
		}

		// Get text channel if registered
		const textChannel = client.channels.cache.get(queueData[0].tc_id) as TextChannel;
		const msgInfo = await textChannel.send({ embeds: [{ title: "Loading queue...", color: 0x00ff00 }] });

		try {
			// *if on loop
			if (mp.loop) {
				const streamInfo = await stream(mp.currentUrl, { quality: 1250, precache: 1000 })!;
				const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });

				mp.player.play(resource);
				client.musicPlayers.get(guild.id)!.seekTime = 0;

				// send message to channel
				msgInfo.edit({
					embeds: [{ title: `▶ Looping current song`, description: `Now playing: [${mp.currentTitle}](${mp.currentUrl})`, color: randomDiscordColor() }],
				});

				return;
			}

			// *if auto
			if (mp.auto) {
				msgInfo.edit({ embeds: [{ title: `⏳ Loading next video in autoplay`, description: `Please wait...`, color: randomDiscordColor() }] });

				// update related id taken this session
				client.musicPlayers.get(guild.id)!.relatedIdTakenThisSession.push(mp.currentId);

				// get related videos
				const relatedGet = await searchClient.getVideo(mp.currentId);

				if (!relatedGet) {
					msgInfo.edit({ embeds: [{ title: `⏳ No related video found`, description: `Please try again later`, color: randomDiscordColor() }] });
					mp.auto = false;
					return;
				}

				// filter out related songs that have been played this session
				// and filter any playListCompact. Playlist compact does not have duration properties
				let filteredNext = relatedGet.related.items.filter((x) => !mp.relatedIdTakenThisSession.includes(x.id)) as (VideoCompact | PlaylistCompact)[];
				filteredNext = filteredNext.filter((x) => (x as VideoCompact).duration);

				const nextVideo = filteredNext[0] as VideoCompact;
				const urlGet = "https://www.youtube.com/watch?v=" + nextVideo.id;
				const streamData = await stream(urlGet, { quality: 1250, precache: 1000 })!;
				const resource = createAudioResource(streamData.stream, { inlineVolume: true, inputType: streamData.type });

				mp.player.play(resource);
				client.musicPlayers.get(guild.id)!.currentId = nextVideo.id;
				client.musicPlayers.get(guild.id)!.currentTitle = nextVideo.title;
				client.musicPlayers.get(guild.id)!.currentUrl = urlGet;
				client.musicPlayers.get(guild.id)!.seekTime = 0;

				// edit embed
				msgInfo.edit({
					embeds: [
						{
							author: { name: "▶ Autoplaying next song" },
							title: `Now playing ${!nextVideo.isLive ? "🎵" : "📺"}`,
							description: `**[${nextVideo.title}](${urlGet})** ${nextVideo.channel ? `by [${nextVideo.channel?.name}](${nextVideo.channel?.url})` : ``}`,
							fields: [
								{
									name: "Live / Duration",
									value: `${nextVideo.isLive ? "Yes" : "No"} / ${nextVideo.duration} seconds`,
									inline: true,
								},
								{
									name: "Views",
									value: nextVideo.viewCount ? `${nextVideo.viewCount.toLocaleString()}` : "Unknown",
									inline: true,
								},
								{
									name: "Upload date",
									value: `${nextVideo.uploadDate}`,
									inline: true,
								},
							],
							color: 0x00ff00,
							thumbnail: {
								url: `https://img.youtube.com/vi/${nextVideo.id}/maxresdefault.jpg`,
							},
						},
					],
					// TODO: add buttons maybe to skip or stop autoplay or something
				});

				return;
			}

			// *if not loop and auto. Check if queue is empty or not
			const queue = queueData[0].queue;
			if (queue.length > 0) {
				// *if queue is not empty
				const nextSong = queue.shift()!;
				const streamInfo = await stream(nextSong.link, { quality: 1250, precache: 1000 })!;
				const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });

				mp.player.play(resource);
				client.musicPlayers.get(guild.id)!.currentId = nextSong.id;
				client.musicPlayers.get(guild.id)!.currentTitle = nextSong.title;
				client.musicPlayers.get(guild.id)!.currentUrl = nextSong.link;
				client.musicPlayers.get(guild.id)!.seekTime = 0;
				client.musicPlayers.get(guild.id)!.query = nextSong.query;
				updateOne_colname("music_state", { gid: guild.id }, { $set: { queue: queue } }); // update queue data

				// send message to channel
				msgInfo.edit({
					embeds: [{ title: `▶ Continuing next song in queue`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: randomDiscordColor() }],
				});
			} else {
				// *if queue is empty
				updateOne_colname("music_state", { gid: guild.id }, { $set: { queue: [] } }); // update queue data
				client.musicPlayers.get(guild.id)!.seekTime = 0;

				// send message telling finished playing all songs
				msgInfo.edit({
					embeds: [
						{
							title: "Finished playing all songs",
							description: "Bot will automatically leave the VC in 5 minutes if no more song is playing.",
							color: randomDiscordColor(),
						},
					],
				});

				// start timeout
				mp.timeOutIdle = setTimeout(() => {
					if (getVoiceConnection(guild.id)) getVoiceConnection(guild.id)?.destroy();
					else guild.members.me?.voice.disconnect();

					client.musicPlayers.get(guild.id)!.relatedIdTakenThisSession = []; // reset relatedIdTaken
					mp.player.stop(); // stop player
				}, 300000); // 5 minutes
			}
		} catch (err) {
			console.log(`[${new Date().toLocaleString()}]`);
			console.error(err);
			msgInfo.edit({ embeds: [{ title: "Error", description: `An error occured while trying to play the song.\n\n\`\`\`${err}\`\`\``, color: randomDiscordColor() }] });
		}
	});
};

export const addNewPlayer = async (client: Client, guild: Guild) => {
	client.musicPlayers.set(guild.id, {
		player: createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Play,
			},
		}),
		currentId: "",
		currentTitle: "",
		currentUrl: "",
		query: "",
		seekTime: 0,
		loop: false,
		auto: false,
		volume: 100, // not used but kept for future use
		timeOutIdle: setTimeout(() => {}),
		relatedIdTakenThisSession: [],
	});

	// set events for the set player
	registerPlayerEvent(client, guild);
};

export const registerPlayers = async (client: Client) => {
	logger.info("Registering music players...");
	client.guilds.cache.forEach(async (guild) => {
		await addNewPlayer(client, guild);
	});
	logger.info("Done! Music players registered.");
};

export const getVideoResource = async (link: string) => {
	const streamInfo = await stream(link, { quality: 1250, precache: 1000 })!;
	return createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });
};

export const sendVideoInfo = async (interaction: ChatInputCommandInteraction<CacheType>, title: string, videoInfo: videoInfo) => {
	interaction.followUp({
		embeds: [
			{
				title: `${title} ${!videoInfo.videoDetails.isLiveContent ? "🎵" : "📺"}`,
				description: `**[${videoInfo.videoDetails.title}](${videoInfo.videoDetails.video_url})** by [${videoInfo.videoDetails.author.name}](${videoInfo.videoDetails.ownerProfileUrl})`,
				fields: [
					{
						name: "Live / Duration",
						value: `${videoInfo.videoDetails.isLiveContent ? "Yes" : "No"} / ${videoInfo.videoDetails.lengthSeconds} seconds`,
						inline: true,
					},
					{
						name: "Views / Likes",
						value: `${parseInt(videoInfo.videoDetails.viewCount).toLocaleString()} / ${videoInfo.videoDetails.likes ? videoInfo.videoDetails.likes.toLocaleString() : 0}`,
						inline: true,
					},
					{
						name: "Upload date",
						value: `${videoInfo.videoDetails.uploadDate}`,
						inline: true,
					},
				],
				color: 0x00ff00,
				thumbnail: {
					url: `https://img.youtube.com/vi/${videoInfo.videoDetails.videoId}/maxresdefault.jpg`,
				},
			},
		],
		content: ``,
		components: [
			{
				type: 1,
				components: [
					new ButtonBuilder() //
						.setURL(videoInfo.videoDetails.video_url)
						.setLabel("Watch on YouTube")
						.setStyle(ButtonStyle.Link)
						.setEmoji("🔗"),
					new ButtonBuilder()
						.setURL(`https://img.youtube.com/vi/${videoInfo.videoDetails.videoId}/maxresdefault.jpg`)
						.setLabel("Open Thumbnail Image")
						.setStyle(ButtonStyle.Link)
						.setEmoji("📷"),
				],
			},
		],
	});
};

const checkConAndGetPlayer = async (client: Client, user: GuildMember, guild: Guild) => {
	// check if user is in vc or not
	if (!user.voice.channel) return { player: null, msg: "⛔ **You must be in a voice channel to use this command!**" };

	// check if bot is in vc or not
	if (!getVoiceConnection(guild.id)) return { player: null, msg: "⛔ **Bot is not connected to any voice channel!**" };

	// get player
	let playerObj = client.musicPlayers.get(guild.id)!;
	if (!playerObj) await addNewPlayer(client, guild);

	return { mp: playerObj ? playerObj : client.musicPlayers.get(guild.id)!, msg: "" };
};

// --------------------------------------------------
// with basic checking
/**
 * Set to autoplay next song or not.
 * @param interaction The interaction object
 */
export const auto = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	mp.auto = !mp.auto;
	return interaction.editReply({
		content: `${mp.auto ? "🪄" : "👌"} **Auto mode ${mp.auto ? "enabled" : "disabled"}**`,
		allowedMentions: { repliedUser: false },
	});
};

/**
 * Clear the queue of the server.
 * @param interaction The interaction object
 */
export const clear = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const guild = interaction.guild!;
	const user = guild.members.cache.get(interaction.user.id)!;
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, user, guild);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	// clear queue data
	let queueData = (await find_colname("music_state", { gid: guild.id })) as IMusicSession[];

	if (queueData.length === 0) insert_colname("music_state", { gid: guild.id, vc_id: user.voice.channelId, tc_id: interaction.channelId, queue: [] });
	else updateOne_colname("music_state", { gid: guild.id }, { $set: { queue: [] } });

	return interaction.editReply({ content: `⏹ **Queue Cleared.**`, allowedMentions: { repliedUser: false } });
};

/**
 * Remove a song from the queue.
 * @param interaction The interaction object
 */
export const remove = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const guild = interaction.guild!;
	const user = guild.members.cache.get(interaction.user.id)!;
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, user, guild);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	const index = interaction.options.getInteger("index", true);
	let queueData = (await find_colname("music_state", { gid: guild.id })) as IMusicSession[];

	if (queueData.length === 0) insert_colname("music_state", { gid: guild.id, vc_id: user.voice.channelId, tc_id: interaction.channelId, queue: [] });
	else {
		const queue = queueData[0].queue;
		if (queue.length === 0) return interaction.editReply({ content: `⛔ **Queue is empty!**`, allowedMentions: { repliedUser: false } });
		if (index > queue.length || index < 1) return interaction.editReply({ content: `⛔ **Index out of range!**`, allowedMentions: { repliedUser: false } });

		const removedSong = queue.splice(index - 1, 1);
		updateOne_colname("music_state", { gid: guild.id }, { $set: { queue: queue } });

		return interaction.editReply({
			content: `✅ **Removed ${removedSong[0].title} - (${removedSong[0].link}) from queue!**`,
			allowedMentions: { repliedUser: false },
		});
	}
};

/**
 * Forward the current song for a specified time.
 * @param interaction The interaction object
 */
export const forward = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	const time = interaction.options.getInteger("seconds", true);
	const videoInfo = await getInfo(mp.currentUrl);
	if (videoInfo.videoDetails.isLiveContent) return interaction.editReply({ content: `⛔ **Cannot seek in live stream!**`, allowedMentions: { repliedUser: false } });
	if (mp.player.state.status !== "playing") return interaction.editReply({ content: `⛔ **Not playing anything**`, allowedMentions: { repliedUser: false } });

	// total forward
	let forwardTime = mp.seekTime + ~~(mp.player.state.playbackDuration / 1000) + time;
	if (forwardTime > parseInt(videoInfo.videoDetails.lengthSeconds))
		return interaction.editReply({ content: `⛔ **Cannot skip past the duration of video time!**`, allowedMentions: { repliedUser: false } }); // if time is greater than video time

	// seek forward
	const streamInfo = await stream(mp.currentUrl, { quality: 1250, precache: 1000, seek: forwardTime });
	const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });
	mp.seekTime = forwardTime;
	mp.player.play(resource);

	return interaction.editReply({ content: `⏩ **Fast forwarded to ${fancyTimeFormat(forwardTime)}!**`, allowedMentions: { repliedUser: false } });
};

/**
 * Rewind the current song for a specified time.
 * @param interaction The interaction object
 */
export const rewind = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	const time = interaction.options.getInteger("seconds", true);
	const videoInfo = await getInfo(mp.currentUrl);
	if (videoInfo.videoDetails.isLiveContent) return interaction.editReply({ content: `⛔ **Cannot seek in live stream!**`, allowedMentions: { repliedUser: false } });
	if (mp.player.state.status !== "playing") return interaction.editReply({ content: `⛔ **Not playing anything**`, allowedMentions: { repliedUser: false } });

	// total rewind time
	let rewindTime = mp.seekTime + ~~(mp.player.state.playbackDuration / 1000) - time;
	if (rewindTime < 0) rewindTime = 0; // if rewind time is negative, set to 0

	// seek backward
	const streamInfo = await stream(mp.currentUrl, { quality: 1250, precache: 1000, seek: rewindTime });
	const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });
	mp.seekTime = rewindTime;
	mp.player.play(resource);

	return interaction.editReply({ content: `⏪ **Rewinded to ${fancyTimeFormat(rewindTime)}!**`, allowedMentions: { repliedUser: false } });
};

/**
 * Seek to a specified time.
 * @param interaction The interaction object
 */
export const seek = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const time = interaction.options.getString("time", true);
	const guild = interaction.guild!;
	const user = guild.members.cache.get(interaction.user.id)!;
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, user, guild);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	// check if time is in seconds or minutes:seconds or hours:minutes:seconds
	let seekTime = 0;
	if (time.includes(":")) {
		const timeArr = time.split(":");
		if (timeArr.length === 3) {
			const hours = parseInt(timeArr[0]);
			const minutes = parseInt(timeArr[1]);
			const seconds = parseInt(timeArr[2]);
			seekTime = hours * 3600 + minutes * 60 + seconds;
		} else if (timeArr.length === 2) {
			const minutes = parseInt(timeArr[0]);
			const seconds = parseInt(timeArr[1]);
			seekTime = minutes * 60 + seconds;
		}
	} else {
		seekTime = parseInt(time);
	}

	// checks
	if (isNaN(seekTime))
		return interaction.editReply({ content: `⛔ **Incorrect format!** Format must be either \`s\` \`mm:ss\` \`hh:mm:ss\``, allowedMentions: { repliedUser: false } }); // format incorrect
	if (seekTime < 0) return interaction.editReply({ content: `⛔ **Time cannot be negative!**`, allowedMentions: { repliedUser: false } }); // time is negative

	try {
		const streamInfo = await stream(mp.currentUrl, { quality: 1250, precache: 1000, seek: seekTime });
		const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });
		mp.seekTime = seekTime;
		mp.player.play(resource);

		return interaction.editReply({ content: `✅ **Seeked to ${seekTime} seconds!**`, allowedMentions: { repliedUser: false } });
	} catch (error) {
		return interaction.editReply({ content: `⛔ **Cannot seek past the duration of video time!** \n\`${error}\``, allowedMentions: { repliedUser: false } });
	}
};

/**
 * Loop the current song.
 * @param interaction The interaction object
 */
export const loop = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	mp.loop = !mp.loop;
	return interaction.editReply({ content: `${mp.loop ? "🔃" : "👌"} **Loop mode ${mp.loop ? "enabled" : "disabled"}**`, allowedMentions: { repliedUser: false } });
};

/**
 * Skip the current song.
 * @param interaction The interaction object
 */
export const skip = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	if (mp.player.state.status === "playing" || mp.player.state.status === "paused") {
		// if on auto
		if (mp.auto) {
			// set player state as idle
			mp.player.state = { status: AudioPlayerStatus.Idle }; // this will be handled in handler to play next song

			await interaction.editReply({
				embeds: [
					{
						title: `⏩ Skipped current song!`,
						description: `Auto mode is on ${mp.loop ? " but loop mode is enabled, looping current song" : ", continuing automatically"}`,
						color: randomDiscordColor(),
					},
				],
			});
			return;
		}

		// get queue data
		const queueData = (await find_colname("music_state", { gid: interaction.guildId })) as IMusicSession[];
		if (queueData.length > 0) {
			const queue = queueData[0].queue;

			if (queue.length > 0) {
				const nextSong = queue.shift()!;
				const streamObj = await stream(nextSong.link, { quality: 1250, precache: 1000 })!;
				const resource = createAudioResource(streamObj.stream, { inlineVolume: true, inputType: streamObj.type });

				mp.player.play(resource);
				mp.currentTitle = nextSong.title;
				mp.currentUrl = nextSong.link;
				mp.seekTime = 0;
				mp.query = mp.query;

				// update queue data
				updateOne_colname("music_state", { gid: interaction.guildId }, { $set: { queue: queue } });

				await interaction.editReply({
					embeds: [{ title: `⏩ Skipped current song!`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: randomDiscordColor() }],
				});
			} else {
				// check if state is playing then stop player
				const wasLoop = mp.loop;
				if (mp.player.state.status === "playing") {
					mp.relatedIdTakenThisSession = [];
					mp.player.stop();
					mp.loop = false;
				}

				// update queue data
				updateOne_colname("music_state", { gid: interaction.guildId }, { $set: { queue: [] } });

				// send message telling finished playing all songs
				await interaction.editReply({
					embeds: [
						{ title: `⏩ Skipped current song!`, description: `Queue is now empty${wasLoop ? `. Loop mode disabled automatically` : `.`}`, color: randomDiscordColor() },
					],
				});
			}
		} else {
			const user = interaction.guild!.members.cache.get(interaction.user.id)!;
			// queue not set in db
			insert_colname("music_state", { gid: interaction.guildId, vc_id: user.voice.channelId, tc_id: interaction.channelId, queue: [] });
		}
	} else {
		return interaction.editReply({ content: `⛔ **Nothing is playing!**`, allowedMentions: { repliedUser: false } });
	}
};
/**
 * Now playing song info.
 * @param interaction The interaction object
 */
export const nowPlaying = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	if (mp.player.state.status !== "playing") return interaction.editReply({ content: `⛔ **Not playing anything**`, allowedMentions: { repliedUser: false } });

	const videoInfo = await getInfo(mp.currentUrl);
	const total = parseInt(videoInfo.videoDetails.lengthSeconds);
	const current = mp.seekTime + ~~(mp.player.state.playbackDuration / 1000);

	let loadBar: string[] = [];
	if (!videoInfo.videoDetails.isLiveContent) {
		loadBar = splitBar(total, current, 18);
		loadBar.pop(); // remove last array element (its a number thingy)
	}

	const embed = new EmbedBuilder()
		.setAuthor({ name: `🎶 ${mp.currentTitle} ${!videoInfo.videoDetails.isLiveContent ? "🎵" : "(📺 Live)"}`, url: mp.currentUrl })
		.setDescription(
			!videoInfo.videoDetails.isLiveContent
				? `${fancyTimeFormat(current)}/${fancyTimeFormat(total)}\n[${loadBar.join("")}]`
				: `Has been running for ${fancyTimeFormatMs(mp.player.state.playbackDuration)}`
		)
		.addFields([
			{
				name: "Uploader",
				value: `[${videoInfo.videoDetails.author.name}](${videoInfo.videoDetails.ownerProfileUrl})`,
				inline: true,
			},
			{
				name: "Views / Likes",
				value: `${parseInt(videoInfo.videoDetails.viewCount).toLocaleString()} / ${videoInfo.videoDetails.likes ? videoInfo.videoDetails.likes.toLocaleString() : 0}`,
				inline: true,
			},
			{
				name: "Upload date",
				value: `${videoInfo.videoDetails.uploadDate}`,
				inline: true,
			},
		])
		.setColor(0x00ff00);

	return interaction.editReply({ embeds: [embed], allowedMentions: { repliedUser: false } });
};

/**
 * Pause the player, if playing.
 * @param interaction The interaction object
 */
export const pause = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	// check playing status
	if (mp.player.state.status === "playing") {
		// pause player
		mp.player.pause();

		return interaction.editReply({ content: `⏸ **Paused**`, allowedMentions: { repliedUser: false } });
	} else if (mp.player.state.status === "paused" || mp.player.state.status === "autopaused") {
		return interaction.editReply({ content: `⛔ **Already paused!**`, allowedMentions: { repliedUser: false } });
	} else {
		return interaction.editReply({ content: `⛔ **Not playing anything!**`, allowedMentions: { repliedUser: false } });
	}
};

/**
 * Unpause the player, if paused.
 * @param interaction The interaction object
 */
export const unpause = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	// check playing status
	if (mp.player.state.status === "paused" || mp.player.state.status === "autopaused") {
		// unpause player
		mp.player.unpause();

		return interaction.editReply({ content: `▶ **Unpaused**`, allowedMentions: { repliedUser: false } });
	} else if (mp.player.state.status === "playing") {
		return interaction.editReply({ content: `⛔ **Already playing!**`, allowedMentions: { repliedUser: false } });
	} else {
		return interaction.editReply({ content: `⛔ **Not playing anything!**`, allowedMentions: { repliedUser: false } });
	}
};

/**
 * Stop the player, if playing.
 * @param interaction The interaction object
 */
export const stop = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const { mp, msg } = await checkConAndGetPlayer(interaction.client, interaction.guild!.members.cache.get(interaction.user.id)!, interaction.guild!);
	if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

	// check playing status
	if (mp.player.state.status === "playing" || mp.player.state.status === "paused") {
		const wasLoop = mp.loop;
		const wasAuto = mp.auto;
		mp.relatedIdTakenThisSession = [];
		mp.auto = false;
		mp.loop = false;
		mp.player.stop();

		return interaction.editReply({
			content: `⏹ **Stopped audio player.**${wasLoop ? ` Loop mode disabled automatically.` : ``} ${wasAuto ? ` Auto mode disabled automatically.` : ``}`,
			allowedMentions: { repliedUser: false },
		});
	} else {
		return interaction.editReply({ content: `⛔ **Not playing anything!**`, allowedMentions: { repliedUser: false } });
	}
};

// --------------------------------------------------
// with special checking
/**
 * Play a song or playlist.
 * @param interaction The interaction object
 */
export const play = async (interaction: ChatInputCommandInteraction<CacheType>, radio: boolean) => {
	let query = radio ? interaction.options.getString("radio", true) : interaction.options.getString("query", true),
		queryLink;
	const guild = interaction.guild!;
	const user = guild.members.cache.get(interaction.user.id)!;

	// check if user is in vc or not
	if (!user.voice.channel)
		return interaction.editReply({
			content: "⛔ **You must be in a voice channel to use this command!**",
			allowedMentions: { repliedUser: false },
		});

	// if query is not a link, search it
	if (validateURL(query)) {
		queryLink = query;
	} else {
		await interaction.editReply({ content: `🔍 **Searching** for \`${query}\`...`, allowedMentions: { repliedUser: false } });

		const res = await search(query, { limit: 5, source: { youtube: "video" } });

		if (res.length === 0) return interaction.editReply({ content: "⛔ **No results found!**", allowedMentions: { repliedUser: false } });

		const limit = res.length > 5 ? 5 : res.length;
		const btnsRow_1 = new ActionRowBuilder<ButtonBuilder>();
		for (let i = 0; i < limit; i++) {
			btnsRow_1.addComponents(
				new ButtonBuilder()
					.setCustomId(`search-${i}`)
					.setLabel(`${i + 1}`)
					.setStyle(ButtonStyle.Primary)
			);
		}

		// cancel button
		const btnsRow_2 = new ActionRowBuilder<ButtonBuilder>();
		btnsRow_2.addComponents(new ButtonBuilder().setCustomId(`search-cancel`).setLabel(`Cancel`).setStyle(ButtonStyle.Danger));

		const embed = new EmbedBuilder()
			.setTitle(`📑 Please choose from the list (⏳3 minute)`)
			.setURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`)
			.setDescription(res.map((data, index) => `${index + 1}. [${data.title}](${data.url})`).join("\n"))
			.setColor(0x00ff00);

		const msg = await interaction.editReply({ content: ``, embeds: [embed], components: [btnsRow_1, btnsRow_2], allowedMentions: { repliedUser: false } });

		const promptGet = await btnPrompter(msg, interaction, 3, true);

		if (!promptGet)
			return interaction.editReply({
				content: `⛔ **Cancelled because input not provided by user!**`,
				allowedMentions: { repliedUser: false },
				components: [],
				embeds: [],
			});

		if (promptGet === "search-cancel")
			return interaction.editReply({ content: `⛔ **Cancelled by user!**`, allowedMentions: { repliedUser: false }, components: [], embeds: [] });

		queryLink = res[parseInt(promptGet.split("-")[1])].url;
	}

	const vc = user.voice.channel;
	let voiceConnection = getVoiceConnection(guild.id);

	if (!getVoiceConnection(guild.id) || !guild.members.me?.voice.channel)
		voiceConnection = joinVoiceChannel({
			channelId: vc.id,
			guildId: guild.id,
			adapterCreator: guild.voiceAdapterCreator,
		});
	// connected but
	// if bot is in vc but is not the same as user vc tell user to use move command first
	else if (guild.members.me?.voice.channel?.id !== vc.id)
		return interaction.editReply({
			content: "⚠ Bot is already connected to another voice channel. Use the `move` command first to move the bot to another channel",
			embeds: [],
			components: [],
		});

	// get player
	let mp = interaction.client.musicPlayers.get(guild.id)!;
	if (!mp) await addNewPlayer(interaction.client, guild);

	await interaction.editReply({ embeds: [], content: `🎶 **Getting info** for \`${query}\``, components: [], allowedMentions: { repliedUser: false } });

	const videoInfo = await getInfo(queryLink);
	await interaction.editReply({ content: `🎶 **Loading** \`${videoInfo.videoDetails.title}\``, allowedMentions: { repliedUser: false } });

	// get video resource
	const queueItem = {
		id: videoInfo.videoDetails.videoId,
		type: videoInfo.videoDetails.isLiveContent ? "live" : "video",
		title: videoInfo.videoDetails.title,
		link: queryLink,
		query: query,
	};

	mp.currentId = queueItem.id;
	mp.currentTitle = queueItem.title;
	mp.currentUrl = queueItem.link;
	mp.seekTime = 0;
	clearTimeout(mp.timeOutIdle);

	if (mp.player.state.status !== "playing") {
		// connect
		const resource = await getVideoResource(queryLink);
		voiceConnection!.subscribe(mp.player);
		mp.player.play(resource);
		mp.query = query;

		// check db set or not
		let checkExist = (await find_colname("music_state", { gid: guild.id })) as IMusicSession[];
		if (checkExist.length === 0) insert_colname("music_state", { gid: guild.id, vc_id: vc.id, tc_id: interaction.channelId, queue: [] });
		else updateOne_colname("music_state", { gid: guild.id }, { $set: { vc_id: vc.id, tc_id: interaction.channelId } });

		await interaction.editReply({ content: `🎶 **Playing** \`${videoInfo.videoDetails.title}\``, allowedMentions: { repliedUser: false } });
		await sendVideoInfo(interaction, "Now Playing", videoInfo);
	} else {
		// add to queue
		// check db set or not
		let checkExist = (await find_colname("music_state", { gid: guild.id })) as IMusicSession[];
		if (!checkExist) insert_colname("music_state", { gid: guild.id, vc_id: vc.id, tc_id: interaction.channelId, queue: [queueItem] });
		else updateOne_colname("music_state", { gid: guild.id }, { $set: { vc_id: vc.id, tc_id: interaction.channelId }, $push: { queue: queueItem } });

		await interaction.editReply({ content: `🎶 **Added to queue** \`${videoInfo.videoDetails.title}\``, allowedMentions: { repliedUser: false } });
		await sendVideoInfo(interaction, "Added to queue", videoInfo);
	}
};
/**
 * Get queue info.
 * @param interaction The interaction object
 */
export const queue = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const guild = interaction.guild!;

	// check if user is in vc or not
	let queueData = (await find_colname("music_state", { gid: guild.id })) as IMusicSession[];

	// if error db
	if (queueData.length === 0) {
		insert_colname("music_state", { gid: guild.id, vc_id: "", tc_id: interaction.channelId, queue: [] });

		// empty queue
		queueData = [{ queue: [] }] as unknown as IMusicSession[];
	}

	const data = queueData[0];
	let maxShown = 10;
	let loopAmount = Math.ceil(data.queue.length / maxShown); // loop amount

	if (data.queue.length <= maxShown) {
		const embedData = new EmbedBuilder()
			.setColor("#0099ff")
			.setThumbnail("https://i.imgur.com/FWKIR7N.png")
			.setAuthor({ name: "Queue for " + guild.name, iconURL: guild.iconURL({ extension: "png", size: 2048 }) as string })
			.setDescription(
				data.queue.length > 0 ? data.queue.map((song: any, index: number) => `${index + 1}. [${song.title}](${song.link})`).join("\n") : "Queue is currently empty!"
			);

		return interaction.editReply({ embeds: [embedData] });
	} else {
		const embedLists = [];

		for (let i = 0; i < loopAmount; i++) {
			const embedData = new EmbedBuilder()
				.setColor("#0099ff")
				.setAuthor({ name: "Queue for " + guild.name, iconURL: guild.iconURL({ extension: "png", size: 2048 }) as string })
				.setThumbnail("https://i.imgur.com/FWKIR7N.png")
				.setDescription(
					data.queue
						.map((song: any, index: number) => `${index + 1}. [${song.title}](${song.link})`)
						.slice(i * 25, (i + 1) * 25)
						.join("\n")
				);

			embedLists.push(embedData);
		}

		interactionBtnPaginator(interaction, embedLists, 5);
	}
};

/**
 * Join a voice channel.
 * @param interaction The interaction object
 */
export const join = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const guild = interaction.guild!;
	const user = guild.members.cache.get(interaction.user.id)!;

	if (!user.voice.channel)
		return interaction.editReply({
			content: "⛔ **You must be in a voice channel to use this command!**",
			allowedMentions: { repliedUser: false },
		});

	if (guild.members.me?.voice.channel && getVoiceConnection(guild.id))
		return interaction.editReply({
			content: "⛔ **Bot is already in a voice channel!** Use `move` command if you want to change it's location",
			allowedMentions: { repliedUser: false },
		});

	joinVoiceChannel({
		channelId: user.voice.channelId!,
		guildId: guild.id,
		adapterCreator: guild.voiceAdapterCreator!,
	});

	// get player
	let mp = interaction.client.musicPlayers.get(guild.id)!;
	if (!mp) await addNewPlayer(interaction.client, guild);

	return interaction.editReply({ content: `✅ **Joined** ${user.voice.channel!}`, allowedMentions: { repliedUser: false } });
};

/**
 * Move bot to another voice channel.
 * @param interaction The interaction object
 */
export const move = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const guild = interaction.guild!;
	const user = guild.members.cache.get(interaction.user.id)!;

	if (!user.voice.channel)
		return interaction.editReply({
			content: "⛔ **You must be in a voice channel to use this command!**",
			allowedMentions: { repliedUser: false },
		});

	if (!guild.members.me?.voice.channel)
		return interaction.editReply({
			content: "⛔ **Bot is not connected to any voice channel!**",
			allowedMentions: { repliedUser: false },
		});

	if (guild.members.me?.voice.channelId === user.voice.channelId)
		return interaction.editReply({ content: "⛔ **You are already in the same voice channel as me!**", allowedMentions: { repliedUser: false } });

	joinVoiceChannel({
		channelId: user.voice.channelId!,
		guildId: guild.id,
		adapterCreator: guild.voiceAdapterCreator,
	});

	return interaction.editReply({ content: `✈ **Moved** to ${user.voice.channel!}`, allowedMentions: { repliedUser: false } });
};

/**
 * Leave a voice channel and stop the player.
 * @param interaction The interaction object
 */
export const leave = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const guild = interaction.guild!;
	const user = guild.members.cache.get(interaction.user.id)!;

	if (!user.voice.channel)
		return interaction.editReply({
			content: "⛔ **You must be in a voice channel to use this command!**",
			allowedMentions: { repliedUser: false },
		});

	if (!guild.members.me?.voice.channel)
		return interaction.editReply({
			content: "⛔ **Bot is not connected to any voice channel!**",
			allowedMentions: { repliedUser: false },
		});

	if (getVoiceConnection(guild.id)) getVoiceConnection(guild.id)!.destroy();
	else guild.members.me?.voice.disconnect();

	// get player
	let mp = interaction.client.musicPlayers.get(guild.id)!;
	if (!mp) {
		await addNewPlayer(interaction.client, guild);
		mp = interaction.client.musicPlayers.get(guild.id)!;
	}

	// stop player
	const wasLoop = mp.loop;
	const wasAuto = mp.auto;
	mp.relatedIdTakenThisSession = [];
	mp.auto = false;
	mp.loop = false;
	mp.player.stop();

	return interaction.editReply({
		content: `👌 **Left** ${guild.members.me.voice.channel}${wasLoop ? ` Loop mode disabled automatically.` : ``} ${wasAuto ? ` Auto mode disabled automatically.` : ``}`,
		allowedMentions: { repliedUser: false },
	});
};

/**
 * Get lyrics of current song or from query.
 * @param interaction The interaction object
 */
export const lyrics = async (interaction: ChatInputCommandInteraction<CacheType>) => {
	const noPicking = interaction.options.getBoolean("no-picking", false);
	let query = interaction.options.getString("query", false),
		lyrics,
		chosen;

	try {
		const channel = interaction.channel!;
		const Client = new Genius.Client();
		const guild = interaction.guild!;
		const user = guild.members.cache.get(interaction.user.id)!;
		const { mp, msg } = await checkConAndGetPlayer(interaction.client, user, guild);
		if (!mp) return interaction.editReply({ content: msg, allowedMentions: { repliedUser: false } });

		// get query
		if (!query) query = mp.query; // querry
		await interaction.editReply({ embeds: [{ description: `Searching for \`${query}\`...`, color: 0x00ff00 }] });

		if (query.length === 0) return interaction.editReply({ embeds: [{ description: `⛔ **No query provided!**`, color: 0xff0000 }] });

		// search
		const songs = await Client.songs.search(query); // search
		if (songs.length === 0) return interaction.editReply({ embeds: [{ description: `No Lyrics for \`${query}\` Found!`, color: 0xff0000 }] }); // no lyrics found

		if (noPicking) {
			chosen = songs[0];
			lyrics = await chosen.lyrics();
		} else {
			// ask user to pick songs
			const limit = songs.length > 5 ? 5 : songs.length;
			const embed = new EmbedBuilder().setTitle("Choose a song").setDescription(
				songs
					.slice(0, limit)
					.map((x, i) => {
						return `**${i + 1}.** ${x.title}`;
					})
					.join("\n")
			);

			const btnsRow = new ActionRowBuilder<ButtonBuilder>();
			for (let i = 0; i < limit; i++) {
				btnsRow.addComponents(
					new ButtonBuilder()
						.setCustomId(`lyrics-${i}`)
						.setLabel(`${i + 1}`)
						.setStyle(ButtonStyle.Primary)
				);
			}

			const promptMsg = await interaction.editReply({ embeds: [embed], components: [btnsRow] });
			const res = await btnPrompter(promptMsg, interaction, 5, true);
			if (!res)
				return interaction.editReply({ embeds: [{ description: `⛔ **Cancelled because input not provided by user!**`, color: 0xff0000 }], components: [], content: "" });

			chosen = songs[parseInt(res.split("-")[1])];
			lyrics = await chosen.lyrics();
		}

		// check if lyrics are empty
		if (lyrics.length == 0)
			return interaction.editReply({ embeds: [{ title: "Something went wrong!", description: `Lyrics won't load (found empty), please try again!` }] });

		const result = new EmbedBuilder().setTitle(chosen.title).setURL(chosen.url).setImage(chosen.image).setColor("Yellow");
		const fetched = await chosen.fetch();
		if (fetched.releasedAt) {
			result.addFields([
				{ name: `Lyrics State`, value: chosen._raw.lyrics_state, inline: true },
				{ name: `Released at`, value: `<t:${convertToEpoch(fetched.releasedAt)}>`, inline: true },
			]);
		}

		await interaction.editReply({ embeds: [result] });

		let start = 0,
			end = 2048;
		for (let i = 0; i < Math.ceil(lyrics.length / 2048); i++) {
			const embed = new EmbedBuilder().setColor("Blue").setDescription(lyrics.slice(start, end));

			start += 2048;
			end += 2048;
			channel.send({ embeds: [embed] });
		}
	} catch (error) {}
};
