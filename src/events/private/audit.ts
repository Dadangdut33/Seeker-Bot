import { Client, TextChannel, Guild, APIEmbed, ChannelType } from "discord.js";
import { find_model, CUSTOM_COLORS } from "../../utils";
import { IBotEvent, AuditWatch_I } from "../../types";
import { logger } from "../../logger";
import { AuditWatchModel } from "../../schemas";
const debugmode = false;

interface optionsInterface {
	options: AuditWatch_I[];
}

function AuditLog(client: Client, options: optionsInterface) {
	// *Deleted message
	client.on("messageDelete", async (message) => {
		if (message.author) if (message.author.bot) return;
		if (message.channel.type === ChannelType.DM) return; // return if dm
		if (debugmode) logger.debug(`Module: ${__filename} | messageDelete triggered`);
		let embedTop: APIEmbed = {
			author: {
				name: `✖️ A message Was Deleted`,
			},
			description: `
**Author : ** <@${message.author!.id}> - *${message.author!.tag}*
**Date : ** <t:${Math.floor(message.createdAt.valueOf() / 1000)}:R>
**Channel : ** <#${message.channel.id}> - *${message.channel.name}*
`,
			color: CUSTOM_COLORS.Black,
			timestamp: new Date().toISOString(),
			footer: {
				text: `Deleted`,
			},
		};

		await send(client, message.guild!, options, embedTop);

		if (message.content) {
			// slice content in loop
			for (let i = 0; i < message.content.length; i += 1024) {
				const content = message.content.slice(i, i + 1024);
				const embed: APIEmbed = {
					description: content,
					color: CUSTOM_COLORS.Black,
				};
				await send(client, message.guild!, options, embed);
			}
			if (debugmode) logger.debug(`Module: ${__filename} | messageDelete triggered`);
		}

		// send image / attachment if exist
		if (message.attachments.size === 0) return;

		let embed: APIEmbed = {
			description: `
**Deleted Image : **
Original: \n${message.attachments.map((x) => x.url).join("\n")}

Proxy: \n${message.attachments.map((x) => x.proxyURL).join("\n")}
`,
			image: {
				url: message.attachments.map((x) => x.url)[0] || message.attachments.map((x) => x.proxyURL)[0] || "",
			},
			color: CUSTOM_COLORS.Black,
			timestamp: new Date().toISOString(),
		};

		if (message && message.member && typeof message.member.guild === "object") {
			await send(client, message.member.guild, options, embed);
		} else {
			console.error(`Module: ${__filename} | messageDelete - ERROR - member guild id couldn't be retrieved`);
			console.error("author", message.author);
			console.error("member", message.member);
			console.error("content", message.content);
		}
	});

	// * Edited message
	client.on("messageUpdate", async (oldMessage, newMessage) => {
		if (oldMessage.author) if (oldMessage.author.bot) return;
		if (oldMessage.channel.type === ChannelType.DM) return; // return if dm
		if (debugmode) logger.debug(`Module: ${__filename} | messageUpdate triggered`);
		// dont send if content is same
		if (oldMessage.content === newMessage.content) return;
		let embedTop: APIEmbed = {
			author: {
				name: `✏️ A Message Was Edited`,
			},
			description: `
**Author : ** <@${oldMessage.author!.id}> - *${oldMessage.author!.tag}*
**Date : ** <t:${Math.floor(oldMessage.createdAt.valueOf() / 1000)}:R>
**Channel : ** <#${oldMessage.channel.id}> - *${oldMessage.channel.name}*
`,
			color: CUSTOM_COLORS.Black,
			timestamp: new Date().toISOString(),
		};

		await send(client, oldMessage.guild!, options, embedTop);

		if (oldMessage.content) {
			// slice content in loop
			for (let i = 0; i < oldMessage.content.length; i += 1024) {
				const content = oldMessage.content.slice(i, i + 1024);
				const embed: APIEmbed = {
					title: i === 0 ? `Before` : undefined,
					description: content,
					color: CUSTOM_COLORS.Black,
				};
				await send(client, oldMessage.guild!, options, embed);
			}
			if (debugmode) logger.debug(`Module: ${__filename} | messageUpdate triggered (old content)`);
		}

		// send image / attachment if exist
		if (oldMessage.attachments.size) {
			try {
				let embed: APIEmbed = {
					description: `
	**Edited Image : **
	Original: \n${oldMessage.attachments.map((x) => x.url).join("\n")}
	Proxy: \n${oldMessage.attachments.map((x) => x.proxyURL).join("\n")}
	`,
					image: {
						url: oldMessage.attachments.map((x) => x.url)[0] || oldMessage.attachments.map((x) => x.proxyURL)[0] || "",
					},
					color: CUSTOM_COLORS.Black,
					timestamp: new Date().toISOString(),
					footer: {
						text: `Attachment`,
					},
				};
				await send(client, oldMessage.guild!, options, embed);
			} catch (error) {
				console.error(`Module: ${__filename} | messageUpdate - ERROR - image couldn't be retrieved`);
			}
		}

		if (newMessage.content) {
			// slice content in loop
			for (let i = 0; i < newMessage.content.length; i += 1024) {
				const content = newMessage.content.slice(i, i + 1024);
				const embed: APIEmbed = {
					title: i === 0 ? `After` : undefined,
					description: content,
					color: CUSTOM_COLORS.Black,
				};
				await send(client, newMessage.guild!, options, embed);
			}
			if (debugmode) logger.debug(`Module: ${__filename} | messageUpdate triggered (new content)`);
		}

		// send image / attachment if exist
		if (newMessage.attachments.size) {
			try {
				let embed: APIEmbed = {
					description: `
	**Edited Image : **
	Original: \n${newMessage.attachments.map((x) => x.url).join("\n")}
	Proxy: \n${newMessage.attachments.map((x) => x.proxyURL).join("\n")}
	`,
					image: {
						url: newMessage.attachments.map((x) => x.url)[0] || newMessage.attachments.map((x) => x.proxyURL)[0] || "",
					},
					color: CUSTOM_COLORS.Black,
					timestamp: new Date().toISOString(),
					footer: {
						text: `Attachment`,
					},
				};
				await send(client, newMessage.guild!, options, embed);
			} catch (error) {
				console.error(`Module: ${__filename} | messageUpdate - ERROR - image couldn't be retrieved`);
			}
		}
	});

	// *USER NICKNAME UPDATE
	client.on("guildMemberUpdate", async (oldMember, newMember) => {
		if (debugmode) logger.debug(`Module: ${__filename} | guildMemberUpdate:nickname triggered`);
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
			await send(client, newMember.guild, options, embed);
		}
	});

	// *USER UPDATE AVATAR, USERNAME, DISCRIMINATOR
	client.on("userUpdate", async (oldUser, newUser) => {
		if (debugmode) logger.debug(`Module: ${__filename} | userUpdate triggered`);

		// Log type
		let usernameChangedMsg: APIEmbed | null = null,
			discriminatorChangedMsg: APIEmbed | null = null,
			avatarChangedMsg: APIEmbed | null = null;

		// search the member from all guilds, since the userUpdate event doesn't provide guild information as it is a global event.
		client.guilds.cache.forEach(async function (guild, guildid) {
			guild.members.cache.forEach(async function (member, memberid) {
				if (newUser.id === memberid) {
					// USERNAME CHANGED
					if (oldUser.username !== newUser.username) {
						if (debugmode) logger.debug(`Module: ${__filename} | userUpdate:USERNAME triggered`);

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
						if (debugmode) logger.debug(`Module: ${__filename} | userUpdate:DISCRIMINATOR triggered`);

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
						if (debugmode) logger.debug(`Module: ${__filename} | userUpdate:AVATAR triggered`);

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

					if (usernameChangedMsg) await send(client, guild, options, usernameChangedMsg);
					if (discriminatorChangedMsg) await send(client, guild, options, discriminatorChangedMsg);
					if (avatarChangedMsg) await send(client, guild, options, avatarChangedMsg);
				}
			});
		});
	});

	// SEND FUNCTION
	async function send(client: Client, guild: Guild, opt: optionsInterface, embed: APIEmbed) {
		try {
			let cur_opt = opt.options.find((val) => val.guildID === guild.id);

			if (!cur_opt) return logger.debug(`Module: ${__filename} | Invalid options ${cur_opt}`);
			if (debugmode) logger.debug(`Module: ${__filename} | configuration get options:`, opt); // DEBUG

			const channelname = cur_opt.outputChName;
			if (!channelname) {
				if (debugmode) logger.debug(`Module: ${__filename} | send - no channel configured`);
				return;
			}

			// check channel
			const channel = guild.channels.cache.find((val) => val.name === channelname) || guild.channels.cache.find((val) => val.id === channelname);
			if (!channel) return logger.debug(`${__filename} -> The channel "${channelname}" do not exist on server "${guild.name}" (${guild.id})`);

			// check permission
			if (!channel.permissionsFor(client.user!)!.has("SendMessages"))
				return logger.debug(
					`${__filename} -> The client doesn't have the permission to send message to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`
				);

			if (!channel.permissionsFor(client.user!)!.has("EmbedLinks"))
				return logger.debug(
					`${__filename} -> The client doesn't have the permission EmbedLinks to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`
				);

			if (debugmode) logger.debug(`Module: ${__filename} | send - sending embed to ${channel.name}`);

			await (channel as TextChannel).send({ embeds: [embed] }).catch(console.error);
		} catch (error) {
			logger.error(`Module: ${__filename} | send - error`, error);
		}
	}
}

const event: IBotEvent = {
	name: "ready",
	loadMsg: `👀 Module: ${__filename} loaded | Watching for changes`,
	once: true,
	execute: async (client: Client) => {
		try {
			const watchlist = (await find_model(AuditWatchModel, {})) as unknown as AuditWatch_I[];
			AuditLog(client, { options: watchlist });
		} catch (error) {
			logger.error(`Module: ${__filename} | Fail to load, details: ${error}`);
		}
	},
};

export default event;
