import { Client, Guild, TextChannel } from "discord.js";
import { IBotEvent, IMusicSession } from "../../types";
import { randomDiscordColor } from "../../utils/helper";
import { find_colname, insert_colname, updateOne_colname } from "../../utils";
import { createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior } from "@discordjs/voice";
import { stream } from "play-dl";
import { Client as ytClient, PlaylistCompact, VideoCompact } from "youtubei";
import { logger } from "../../logger";
const searchClient = new ytClient();

const addNewPlayer = async (client: Client, guild: Guild) => {
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
	const mp = client.musicPlayers.get(guild.id)!;
	mp.player.on("stateChange", async () => {
		// verify if idle or stopped
		if (mp.player.state.status !== "idle") return;

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
								url: `https://img.youtube.com/vi/${nextVideo.id}/hqdefault.jpg`,
							},
						},
					],
					// TODO: add buttons maybe to skip or stop autoplay or something
				});

				return;
			}

			// *if not loop and auto check if queue is empty or not
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

const registerPlayers = async (client: Client) => {
	logger.info("Registering music players...");
	client.guilds.cache.forEach(async (guild) => {
		await addNewPlayer(client, guild);
	});
	logger.info("Done! Music players registered.");
};

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `👀 Module: 📨 ${__filename} loaded`,
	execute: async (client: Client) => {
		await registerPlayers(client);
	},
};

export default event;
