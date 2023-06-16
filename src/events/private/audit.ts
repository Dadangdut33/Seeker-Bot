import { Client, TextChannel, Guild, APIEmbed, ChannelType } from "discord.js";
import { find_model, CUSTOM_COLORS } from "../../utils";
import { BotEvent, IAuditWatch } from "../../types";
import { logger } from "../../logger";
import { AuditWatchModel } from "../../schemas";
const debugmode = false;
const moduleName = "audit.ts";

interface optionsInterface {
	options: IAuditWatch[];
}

function AuditLog(client: Client, options: optionsInterface) {
	// *Deleted image | Only if the message contains image
	client.on("messageDelete", (message) => {
		if (message.author) if (message.author.bot) return;
		if (message.channel.type === ChannelType.DM) return; // return if dm
		if (message.attachments.size === 0) return;
		if (debugmode) logger.debug(`Module: ${moduleName} | messageDelete triggered`);

		let embed: APIEmbed = {
			description: `
**Author : ** <@${message.author!.id}> - *${message.author!.tag}*
**Date : ** <t:${message.createdAt.valueOf() / 1000}:R>
**Channel : ** <#${message.channel.id}> - *${message.channel.name}*

**Deleted Image : **
Original: \n${message.attachments.map((x) => x.url).join("\n")}

Proxy: \n${message.attachments.map((x) => x.proxyURL).join("\n")}
`,
			image: {
				url: message.attachments.map((x) => x.url)[0] || message.attachments.map((x) => x.proxyURL)[0] || "",
			},
			color: CUSTOM_COLORS.Black,
			timestamp: new Date().toISOString(),
			footer: {
				text: `Deleted`,
			},
			author: {
				name: `✖️ An Image Was Deleted`,
			},
		};

		if (message && message.member && typeof message.member.guild === "object") {
			send(client, message.member.guild, options, embed);
		} else {
			console.error(`Module: ${moduleName} | messageDelete - ERROR - member guild id couldn't be retrieved`);
			console.error("author", message.author);
			console.error("member", message.member);
			console.error("content", message.content);
		}
	});

	// *USER NICKNAME UPDATE
	client.on("guildMemberUpdate", (oldMember, newMember) => {
		if (debugmode) logger.debug(`Module: ${moduleName} | guildMemberUpdate:nickname triggered`);
		if (oldMember.nickname !== newMember.nickname) {
			let embed: APIEmbed = {
				description: `<@${newMember.user.id}> - *${newMember.user.id}*`,
				url: newMember.user.displayAvatarURL({ extension: "png", size: 2048 }),
				color: CUSTOM_COLORS.Aqua,
				timestamp: new Date().toISOString(),
				footer: {
					text: `${newMember.nickname || newMember.user.username}`,
				},
				thumbnail: {
					url: newMember.user.displayAvatarURL({ extension: "png", size: 2048 }),
				},
				author: {
					name: `👤 Nickname Changed: ${newMember.user.tag}`,
				},
				fields: [
					{
						name: "Old Nickname",
						value: `**${oldMember.nickname || oldMember.user!.username}**`,
						inline: true,
					},
					{
						name: "New Nickname",
						value: `**${newMember.nickname || newMember.user.username}**`,
						inline: true,
					},
				],
			};
			send(client, newMember.guild, options, embed);
		}
	});

	// *USER UPDATE AVATAR, USERNAME, DISCRIMINATOR
	client.on("userUpdate", (oldUser, newUser) => {
		if (debugmode) logger.debug(`Module: ${moduleName} | userUpdate triggered`);

		// Log type
		let usernameChangedMsg: APIEmbed | null = null,
			discriminatorChangedMsg: APIEmbed | null = null,
			avatarChangedMsg: APIEmbed | null = null;

		// search the member from all guilds, since the userUpdate event doesn't provide guild information as it is a global event.
		client.guilds.cache.forEach(function (guild, guildid) {
			guild.members.cache.forEach(function (member, memberid) {
				if (newUser.id === memberid) {
					// USERNAME CHANGED
					if (oldUser.username !== newUser.username) {
						if (debugmode) logger.debug(`Module: ${moduleName} | userUpdate:USERNAME triggered`);

						usernameChangedMsg = {
							description: `<@${newUser.id}> - *${newUser.id}*`,
							url: newUser.displayAvatarURL({ extension: "png", size: 2048 }),
							color: CUSTOM_COLORS.Aqua,
							timestamp: new Date().toISOString(),
							footer: {
								text: `${member.nickname || member.user.username}`,
							},
							thumbnail: {
								url: newUser.displayAvatarURL({ extension: "png", size: 2048 }),
							},
							author: {
								name: `👤 Username Changed: ${newUser.tag}`,
							},
							fields: [
								{
									name: "Old Username",
									value: `**${oldUser.username}**`,
									inline: true,
								},
								{
									name: "New Username",
									value: `**${newUser.username}**`,
									inline: true,
								},
							],
						};
					}

					// DISCRIMINATOR CHANGED
					if (oldUser.discriminator !== newUser.discriminator) {
						if (debugmode) logger.debug(`Module: ${moduleName} | userUpdate:DISCRIMINATOR triggered`);

						discriminatorChangedMsg = {
							description: `<@${newUser.id}> - *${newUser.id}*`,
							url: newUser.displayAvatarURL({ extension: "png", size: 2048 }),
							color: CUSTOM_COLORS.Aqua,
							timestamp: new Date().toISOString(),
							footer: {
								text: `${member.nickname || member.user.username}`,
							},
							thumbnail: {
								url: newUser.displayAvatarURL({ extension: "png", size: 2048 }),
							},
							author: {
								name: `👤 Discriminator Changed: ${newUser.tag}`,
								icon_url: "https://cdn.discordapp.com/emojis/435119390078271488.png",
							},
							fields: [
								{
									name: "Old Discriminator",
									value: `**${oldUser.discriminator}**`,
									inline: true,
								},
								{
									name: "New Discriminator",
									value: `**${newUser.discriminator}**`,
									inline: true,
								},
							],
						};
					}

					// AVATAR CHANGED
					if (oldUser.avatar !== newUser.avatar) {
						if (debugmode) logger.debug(`Module: ${moduleName} | userUpdate:AVATAR triggered`);

						avatarChangedMsg = {
							description: `<@${newUser.id}> - *${newUser.id}*\n\n**Old Avatar** :arrow_down:`,
							url: newUser.displayAvatarURL({ extension: "png", size: 2048 }),
							color: CUSTOM_COLORS.Aqua,
							timestamp: new Date().toISOString(),
							footer: {
								text: `Old avatar might not show up`,
							},
							thumbnail: {
								url: newUser.displayAvatarURL({ extension: "png", size: 2048 }),
							},
							author: {
								name: `👤 Avatar Changed: ${newUser.tag}`,
							},
							image: {
								url: oldUser.displayAvatarURL({ extension: "png", size: 2048 }) || oldUser.avatarURL({ extension: "png", size: 2048 }) || "",
							},
						};
					}

					if (usernameChangedMsg) send(client, guild, options, usernameChangedMsg);
					if (discriminatorChangedMsg) send(client, guild, options, discriminatorChangedMsg);
					if (avatarChangedMsg) send(client, guild, options, avatarChangedMsg);
				}
			});
		});
	});

	// SEND FUNCTION
	function send(client: Client, guild: Guild, opt: optionsInterface, embed: APIEmbed) {
		try {
			let cur_opt = opt.options.find((val) => val.guildID === guild.id);

			if (!cur_opt) return logger.debug(`Module: ${moduleName} | Invalid options ${cur_opt}`);
			if (debugmode) logger.debug(`Module: ${moduleName} | configuration get options:`, opt); // DEBUG

			const channelname = cur_opt.outputChName;
			if (!channelname) {
				if (debugmode) logger.debug(`Module: ${moduleName} | send - no channel configured`);
				return;
			}

			// check channel
			const channel = guild.channels.cache.find((val) => val.name === channelname) || guild.channels.cache.find((val) => val.id === channelname);
			if (!channel) return logger.debug(`${moduleName} -> The channel "${channelname}" do not exist on server "${guild.name}" (${guild.id})`);

			// check permission
			if (!channel.permissionsFor(client.user!)!.has("SendMessages"))
				return logger.debug(
					`${moduleName} -> The client doesn't have the permission to send message to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`
				);

			if (!channel.permissionsFor(client.user!)!.has("EmbedLinks"))
				return logger.debug(
					`${moduleName} -> The client doesn't have the permission EmbedLinks to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`
				);

			if (debugmode) logger.debug(`Module: ${moduleName} | send - sending embed to ${channel.name}`);

			(channel as TextChannel).send({ embeds: [embed] }).catch(console.error);
		} catch (error) {
			logger.error(`Module: ${moduleName} | send - error`, error);
		}
	}
}

const event: BotEvent = {
	name: "ready",
	loadMsg: `🔃 Loaded ${moduleName} | Watching for changes`,
	once: true,
	execute: async (client: Client) => {
		try {
			const watchlist = (await find_model(AuditWatchModel, {})) as unknown as IAuditWatch[];
			AuditLog(client, { options: watchlist });
		} catch (error) {
			logger.error(`Module: ${moduleName} | Fail to load, details: ${error}`);
		}
	},
};

export default event;
