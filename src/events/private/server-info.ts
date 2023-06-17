import { Client, Guild, EmbedBuilder, TextChannel, GuildEmoji } from "discord.js";
import moment from "moment-timezone";
import { IBotEvent } from "../../types";
import { logger } from "../../logger";
import { OnlineUsers as onlineUsers, getEmoji, getMemberNewest, getMemberOldest, totalBots } from "../../utils/helper";
import { prettyMilliseconds } from "../../utils/prettyms";

const embedStats = (
	client: Client,
	guild: Guild,
	channelID: string,
	id_embed_serverInfo: string,
	rulesChannelID: string,
	modRolesID: string,
	totalBots: number,
	onlineUsers: number,
	age: number
) => {
	client.channels.fetch(channelID).then((channel) => {
		// First fetch channel from client
		(channel as TextChannel).messages.fetch(id_embed_serverInfo).then((msg) => {
			// Then fetch the message
			let embed = new EmbedBuilder()
				.setAuthor({ name: guild.name, iconURL: guild.iconURL({ extension: "png", size: 2048 })! })
				.setTitle("Server Information")
				.setDescription(
					`Welcome To ${
						guild.name
					}! This embed contains some information of the server. Before you start participating please read the rules first in <#${rulesChannelID}>. If you have any questions feel free to ask the owner (<@${
						guild.ownerId
					}>) or <@&${modRolesID}>. Once again welcome, have fun, & please enjoy your stay ^^\n\n[[Get Server Icon]](${guild.iconURL({ extension: "png", size: 2048 })})`
				)
				.setThumbnail(guild.iconURL({ extension: "png", size: 2048 })!)
				.setFields([
					{ name: "Server Owner", value: `<@${guild.ownerId}>`, inline: true },
					{ name: "Server Age", value: `${prettyMilliseconds(age)}`, inline: true },
					{ name: "Server Permanent Link", value: `${process.env.Server_invite}`, inline: false },
					{
						name: "Server Created At / Age",
						value: `${moment(guild.createdAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")} GMT+0700 / ${prettyMilliseconds(age)}`,
						inline: false,
					},
					{ name: `Rules & Guides Channel`, value: `<#${rulesChannelID}>`, inline: true },
					{ name: "Default Notification", value: guild.defaultMessageNotifications.toString(), inline: true },
					{ name: "AFK Timeout", value: guild.afkTimeout.toString(), inline: true },
					{ name: "Nitro/Booster", value: `LVL. ${guild.premiumTier}/${guild.premiumSubscriptionCount} Booster(s)`, inline: true },
					{ name: "Total Members", value: guild.memberCount.toString(), inline: true },
					{ name: "Total Bots", value: totalBots.toString(), inline: true },
					{ name: "Status (User Only)", value: `**Online :** ${totalBots}\n**Offline :** ${guild.memberCount - totalBots - onlineUsers}`, inline: false },
				])
				.setColor("Random");

			msg.edit({ embeds: [embed] });
		});
	});
};

const embedMember = (client: Client, channelID: string, memberInfoID: string, oldest: string[], newest: string[]) => {
	client.channels.fetch(channelID).then((channel) => {
		// First fetch channel from client
		(channel as TextChannel).messages.fetch(memberInfoID).then((msg) => {
			// Then fetch the message
			let embed = new EmbedBuilder()
				.setTitle("15 oldest & newest member")
				.setDescription(`**Oldest Member**\n${oldest.join("\n")}\n\n**Newest Member**\n${newest.join("\n")}`)
				.setFooter({ text: "Last Updated" })
				.setColor("Random")
				.setTimestamp();

			msg.edit({ embeds: [embed] });
		});
	});
};

const embedNonAnimatedEmojis = (client: Client, channelID: string, id_embed: string, emojis: GuildEmoji[]) => {
	const animatedOnly = emojis.filter((emoji) => emoji.animated);

	client.channels.fetch(channelID).then((channel) => {
		// First fetch channel from client
		(channel as TextChannel).messages.fetch(id_embed).then((msg) => {
			let store: string[] = [],
				embedLists: EmbedBuilder[] = [],
				counter = 1;

			animatedOnly.forEach((emoji) => {
				store.push(`<a:${emoji.name}:${emoji.id}>`);

				if (store.length >= 50) {
					let embed = new EmbedBuilder() //
						.setDescription(`**[${counter}]**\n${store.join(" ")}`)
						.setColor("Random");

					if (counter == 1) embed.setTitle(`Server Emojis`);

					embedLists.push(embed);
					store = [];
					counter++;
				}
			});

			if (store.length > 0) {
				let embed = new EmbedBuilder() //
					.setDescription(`**[${counter}]**\n${store.join(" ")}`)
					.setColor("Random");
				embedLists.push(embed);
			}

			msg.edit({ embeds: embedLists });
		});
	});
};

const embedAnimatedEmojis = (client: Client, channelID: string, id_embed: string, emojis: GuildEmoji[]) => {
	const animatedOnly = emojis.filter((emoji) => emoji.animated);

	client.channels.fetch(channelID).then((channel) => {
		// First fetch channel from client
		(channel as TextChannel).messages.fetch(id_embed).then((msg) => {
			let store: string[] = [],
				embedLists: EmbedBuilder[] = [],
				counter = 1;

			animatedOnly.forEach((emoji) => {
				store.push(`<a:${emoji.name}:${emoji.id}>`);

				if (store.length >= 50) {
					let embed = new EmbedBuilder() //
						.setDescription(`**[${counter}]**\n${store.join(" ")}`)
						.setColor("Random");

					embedLists.push(embed);
					store = [];
					counter++;
				}
			});

			if (store.length > 0) {
				let embed = new EmbedBuilder() //
					.setDescription(`**[${counter}]**\n${store.join(" ")}`)
					.setColor("Random");
				embedLists.push(embed);
			}

			// edit the last one add footer total emojis
			embedLists[embedLists.length - 1].setFooter({ text: `Total Emojis : ${emojis.length}` });

			msg.edit({ embeds: embedLists });
		});
	});
};

const jump = (
	client: Client,
	guildID: string,
	channelID: string,
	id_embed_serverInfo: string,
	jumpChannelID: string,
	jumpToGeneral: string,
	vcGeneral: string,
	publicStage: string
) => {
	client.channels.fetch(channelID).then((channel) => {
		// First fetch channel from client
		(channel as TextChannel).messages.fetch(jumpChannelID).then((msg) => {
			let goTop = `https://discord.com/channels/${guildID}/${channelID}/${id_embed_serverInfo}`;
			// Then fetch the message
			let embed = new EmbedBuilder()
				.setTitle("Quick Links")
				.setDescription(`[\[Go To The Top\]](${goTop}) | <#${jumpToGeneral}> | <#${vcGeneral}> | <#${publicStage}>`)
				.setColor("Random");

			msg.edit({ embeds: [embed] });
		});
	});
};

const startServerInfoPoll = (
	client: Client,
	guildID: string,
	channelID: string,
	rulesChannelID: string,
	modRolesID: string,
	id_embed_serverInfo: string,
	id_embed_nonanimatedEmojis: string,
	id_embed_animatedEmojis: string,
	memberInfoID: string,
	jumpChannelID: string,
	jumpToGeneral: string,
	vcGeneral: string,
	publicStage: string
) => {
	try {
		const guild = client.guilds.cache.get(guildID)!;

		// update embeds
		embedStats(
			client,
			guild,
			channelID,
			id_embed_serverInfo,
			rulesChannelID,
			modRolesID,
			totalBots(guild),
			onlineUsers(guild),
			new Date().getTime() - guild.createdAt.getTime()
		);
		embedAnimatedEmojis(client, channelID, id_embed_animatedEmojis, getEmoji(guild));
		embedNonAnimatedEmojis(client, channelID, id_embed_nonanimatedEmojis, getEmoji(guild));
		embedMember(client, channelID, memberInfoID, getMemberOldest(guild).slice(0, 15), getMemberNewest(guild).slice(0, 15));
		jump(client, guildID, channelID, id_embed_serverInfo, jumpChannelID, jumpToGeneral, vcGeneral, publicStage);
	} catch (error) {
		logger.error(`Error when updating server info: ${error}`);
	}
};

const event: IBotEvent = {
	name: "ready",
	once: true,
	loadMsg: `Module: Server info loaded`,
	execute: async (client: Client) => {
		const guildID = process.env.PERSONAL_SERVER_ID,
			// too much to be put into .env so just put it here if you want to use it
			id_info = {
				msgChannelID: "820964768067878922",
				rulesChannelID: "640825665310031882",
				modRolesID: "645494894613233665",
				id_embed_serverInfo: "820964895767265280",
				id_embed_nonanimatedEmojis: "821170444509380639",
				id_embed_animatedEmojis: "821170482945458196",
				memberInfoID: "821205412795383871",
				jumpChannelID: "821206531730571274",
				jumpToGeneral: "640790708155842575",
				vcGeneral: "640790708155842587",
				publicStage: "827086299051196426",
			};

		logger.debug(...Object.values(id_info));
		if (!guildID) return logger.warn("guild or channel ID not set!");

		const theGuild = client.guilds.cache.get(guildID);
		if (!theGuild) return logger.warn("Invalid guild server info!");

		try {
			// @ts-ignore
			startServerInfoPoll(client, guildID, ...Object.values(id_info));

			setInterval(() => {
				// @ts-ignore
				startServerInfoPoll(client, guildID, ...Object.values(id_info));
			}, 900000); // Every 15 minutes
		} catch (e) {
			logger.error(`[ERROR] [server-info] ${e}`);
		}
	},
};

export default event;
