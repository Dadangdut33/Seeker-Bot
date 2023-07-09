import {
	GuildMember,
	PermissionFlagsBits,
	PermissionResolvable,
	TextChannel,
	Guild,
	ChatInputCommandInteraction,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Message,
	CacheType,
	ComponentType,
} from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import moment from "moment-timezone";
import { prettyMilliseconds } from "./locallib/prettyms";
import { consoleColorType, CONSOLE_COLORS } from "./constants";
import { logger } from "../logger";

export const logColor = (color: consoleColorType, message: any) => {
	return chalk.hex(CONSOLE_COLORS[color])(message);
};

export const randomDiscordColor = () => {
	return Math.floor(Math.random() * 16777215);
};

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
	let neededPermissions: PermissionResolvable[] = [];
	permissions.forEach((permission) => {
		if (!member.permissions.has(permission)) neededPermissions.push(permission);
	});
	if (neededPermissions.length === 0) return null;
	return neededPermissions.map((p) => {
		if (typeof p === "string") return p.split(/(?=[A-Z])/).join(" ");
		else
			return Object.keys(PermissionFlagsBits)
				.find((k) => Object(PermissionFlagsBits)[k] === p)
				?.split(/(?=[A-Z])/)
				.join(" ");
	});
};

export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
	channel.send(message).then((m) => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration));
	return;
};

export const walkdir = (directory: string): string[] => {
	return readdirSync(directory, { withFileTypes: true }).flatMap((file) => (file.isDirectory() ? walkdir(join(directory, file.name)) : join(directory, file.name)));
};

export const getEmoji = (guild: Guild) => {
	return guild.emojis.cache.map((emojis) => {
		return emojis;
	});
};

export const OnlineUsers = (guild: Guild) => {
	let totalMemberInGuild = guild.memberCount,
		offline = guild.members.cache.filter((m) => !m.presence).size;

	return totalMemberInGuild - offline;
};

export const totalBots = (guild: Guild) => {
	let bots = guild.members.cache.filter((m) => m.user.bot).size;

	return bots;
};

export const getMemberNewest = (guild: Guild) => {
	let index = 0;

	return guild.members.cache
		.sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!)
		.map((GuildMember) => {
			let age = moment().tz("Asia/Jakarta").valueOf() - GuildMember.joinedAt!.getTime();
			index++;
			return `${index}. <t:${~~(moment(GuildMember.joinedAt).tz("Asia/Jakarta").valueOf() / 1000)}:R> <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
		});
};

export const getMemberOldest = (guild: Guild) => {
	let index = 0;

	return guild.members.cache
		.sort((a, b) => b.joinedTimestamp! - a.joinedTimestamp!)
		.map((GuildMember) => {
			let age = moment().tz("Asia/Jakarta").valueOf() - GuildMember.joinedAt!.getTime();
			index++;
			return `${index}. <t:${~~(moment(GuildMember.joinedAt).tz("Asia/Jakarta").valueOf() / 1000)}:R> <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
		});
};

export const convertToEpoch = (date: Date) => {
	return Math.floor(date.getTime() / 1000);
};

interface embedPaginator_optional {
	content?: string | null | undefined;
	btns?: ActionRowBuilder<ButtonBuilder> | null | undefined;
	btns_id?: string[] | null | undefined;
	components_function?: ((index: number) => ActionRowBuilder<ButtonBuilder> | null) | null | undefined;
}

const calculateFooter = (index: number, cur_embed: EmbedBuilder, pageLength: number) => {
	if (cur_embed.toJSON().footer && cur_embed.toJSON().footer?.text) {
		// if already contains Page x/x return it
		if (cur_embed.toJSON().footer?.text?.includes(`Page ${index + 1}/${pageLength}`)) return cur_embed.toJSON().footer?.text!;
		else return `Page ${index + 1}/${pageLength}` + cur_embed.toJSON().footer?.text;
	} else {
		return `Page ${index + 1}/${pageLength}`;
	}
};

/**
 * Embed paginator with buttons for interaction
 * The concept is simple, it will edit the message with new embeds and new buttons on each button click
 * Default buttons are: Previous, Close, Next
 */
export const interactionBtnPaginator = async (
	interaction: ChatInputCommandInteraction,
	embeds: EmbedBuilder[],
	timeout: number,
	{ content, btns, btns_id, components_function }: embedPaginator_optional = {}
) => {
	// ------------------ //
	// Default row Button
	if (!btns)
		btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("first").setEmoji("⏮️").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("back").setEmoji("⬅️").setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId("next").setEmoji("➡️").setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId("last").setEmoji("⏭️").setStyle(ButtonStyle.Primary)
		);

	let index = 0,
		closedManually = false;

	const btns_id_list = btns_id ? btns_id : ["first", "back", "stop", "next", "last"],
		originalEmbed = embeds.map((embed) => embed), // copy it in new array
		msg = await interaction.editReply({
			content: content ? content : "",
			embeds: [embeds[0].setFooter({ text: calculateFooter(index, originalEmbed[index], embeds.length) })],
			components: [btns],
		}),
		collector = msg.createMessageComponentCollector({ time: timeout * 1000 * 60, componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });

	// ------------------ //
	collector.on("collect", async (i) => {
		// filter only the id that we want
		if (!btns_id_list.includes(i.customId)) return;

		switch (i.customId) {
			case "first":
				index = 0;
			case "next":
				index++;
				if (index >= embeds.length) index = 0;
				break;
			case "back":
				index--;
				if (index < 0) index = embeds.length - 1;
				break;
			case "last":
				index = embeds.length - 1;
				break;
			case "stop":
				await i.update({ components: [] });

				closedManually = true;
				collector.stop();
				return; // stop the function
		}

		logger.info(`[Embed Paginator] ${interaction.user.tag} switched to page ${index + 1}/${embeds.length}`);
		if (components_function) {
			let temp = components_function(index),
				components = [btns!];
			if (temp) components.push(temp);

			await i.update({
				embeds: [embeds[index].setFooter({ text: calculateFooter(index, originalEmbed[index], embeds.length) })],
				components: components,
			});
		} else {
			await i.update({ embeds: [embeds[index].setFooter({ text: calculateFooter(index, originalEmbed[index], embeds.length) })] });
		}
	});

	// ------------------ //
	collector.on("end", async () => {
		// check footer if there exist a footer
		const footerEnd =
			originalEmbed[index].toJSON().footer && originalEmbed[index].toJSON().footer?.text
				? originalEmbed[index].toJSON().footer?.text + ` | ${closedManually ? "Page switcher closed" : "Page switcher closed due to timeout"}`
				: `${closedManually ? "Page switcher closed" : "Page switcher closed due to timeout"}`;

		if (interaction.ephemeral) await interaction.deleteReply(); // delete the original reply if it's ephemeral
		else await msg.edit({ embeds: [embeds[index].setFooter({ text: footerEnd })], components: [] });
	});
};

/**
 * Embed paginator with buttons for interaction but with multiple embeds per page
 */
export const interactionBtnMultiEmbedPaginator = async (
	interaction: ChatInputCommandInteraction,
	embeds: EmbedBuilder[],
	embed_per_page: number,
	timeout: number,
	{ content, btns, btns_id, components_function }: embedPaginator_optional = {}
) => {
	// ------------------ //
	// Default row Button
	if (!btns)
		btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("first").setEmoji("⏮️").setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId("back").setEmoji("⬅️").setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId("next").setEmoji("➡️").setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId("last").setEmoji("⏭️").setStyle(ButtonStyle.Primary)
		);

	let index = 0,
		closedManually = false,
		slice_start = index * embed_per_page,
		slice_end = index * embed_per_page + embed_per_page;

	const btns_id_list = btns_id ? btns_id : ["first", "back", "stop", "next", "last"],
		limitPageMove = Math.ceil(embeds.length / embed_per_page),
		originalEmbed = embeds.map((embed) => embed), // copy it in new array
		msg = await interaction.editReply({
			content: content ? content : "",
			embeds: embeds.slice(slice_start, slice_end).map((embed, i) => {
				// only change the footer of the last embed
				const len = embeds.slice(slice_start, slice_end).length;
				if (i === len - 1) return embed.setFooter({ text: calculateFooter(index, originalEmbed[index * embed_per_page], limitPageMove) });
				else return embed;
			}),
			components: [btns],
		}),
		collector = msg.createMessageComponentCollector({ time: timeout * 1000 * 60, componentType: ComponentType.Button, filter: (i) => i.user.id === interaction.user.id });

	// ------------------ //
	collector.on("collect", async (i) => {
		// filter only the id that we want
		if (!btns_id_list.includes(i.customId)) return;

		switch (i.customId) {
			case "first":
				index = 0;
			case "next":
				index++;
				if (index >= limitPageMove) index = 0;
				break;
			case "back":
				index--;
				if (index < 0) index = limitPageMove - 1;
				break;
			case "last":
				index = limitPageMove - 1;
				break;
			case "stop":
				await i.update({ components: [] });

				closedManually = true;
				collector.stop();

				return; // stop the function
		}

		slice_start = index * embed_per_page;
		slice_end = index * embed_per_page + embed_per_page;
		if (components_function) {
			let temp = components_function(index),
				components = [btns!];
			if (temp) components.push(temp);

			await i.update({
				embeds: embeds.slice(slice_start, slice_end).map((embed, i) => {
					const len = embeds.slice(slice_start, slice_end).length;
					if (i === len - 1) return embed.setFooter({ text: calculateFooter(index, originalEmbed[index * embed_per_page], limitPageMove) });
					else return embed;
				}),
				components: components,
			});
		} else {
			await i.update({
				embeds: embeds.slice(slice_start, slice_end).map((embed, i) => {
					const len = embeds.slice(slice_start, slice_end).length;
					if (i === len - 1) return embed.setFooter({ text: calculateFooter(index, originalEmbed[index * embed_per_page], limitPageMove) });
					else return embed;
				}),
			});
		}
	});

	// ------------------ //
	collector.on("end", async () => {
		const footerEnd = closedManually
			? `Page ${index + 1}/${limitPageMove} | Page switcher closed`
			: `Page ${index + 1}/${limitPageMove} | Page switcher closed due to timeout`;

		if (interaction.ephemeral) await interaction.deleteReply(); // delete the original reply if it's ephemeral
		else
			await msg.edit({
				embeds: embeds.slice(slice_start, slice_end).map((embed, i) => {
					const len = embeds.slice(slice_start, slice_end).length;
					if (i === len - 1) return embed.setFooter({ text: footerEnd });
					else return embed;
				}),
				components: [],
			}); // edit the original reply if it's not ephemeral
	});
};

export const btnPrompter = async (msg: Message<boolean>, interaction: ChatInputCommandInteraction<CacheType>, timeout: number, senderOnly = true) => {
	return msg
		.awaitMessageComponent({
			filter: senderOnly ? (args) => args.user.id == interaction.user.id : undefined,
			time: timeout * 1000,
			componentType: ComponentType.Button,
			dispose: true,
		})
		.then((i) => {
			i.deferUpdate();
			return i.customId;
		})
		.catch(() => {
			return null;
		});
};
