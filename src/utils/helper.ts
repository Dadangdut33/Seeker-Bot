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

export const logColor = (color: consoleColorType, message: any) => {
	return chalk.hex(CONSOLE_COLORS[color])(message);
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

export const embedInteractionWithBtnPaginator = async (
	interaction: ChatInputCommandInteraction,
	embeds: EmbedBuilder[],
	timeout: number,
	content?: string,
	btns?: ActionRowBuilder<ButtonBuilder>
) => {
	// ------------------ //
	if (!btns)
		// Default Button
		btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("back").setLabel("Previous").setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId("stop").setLabel("Close").setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Secondary)
		);
	// ------------------ //
	const calculateFooter = (index: number, cur_embed: EmbedBuilder) => {
		if (cur_embed.toJSON().footer && cur_embed.toJSON().footer?.text) {
			// if already contains Page x/x return it
			if (cur_embed.toJSON().footer?.text?.includes(`Page ${index + 1}/${embeds.length}`)) return cur_embed.toJSON().footer?.text!;
			else return `Page ${index + 1}/${embeds.length}` + cur_embed.toJSON().footer?.text;
		} else {
			return `Page ${index + 1}/${embeds.length}`;
		}
	};
	// ------------------ //
	const originalEmbed = embeds.map((embed) => embed); // copy it in new array
	let index = 0,
		closedManually = false;
	const msg = await interaction.editReply({
		content: content ? content : "",
		embeds: [embeds[0].setFooter({ text: calculateFooter(index, originalEmbed[index]) })],
		components: [btns],
	});
	const collector = msg.createMessageComponentCollector({ time: timeout * 1000 * 60 });

	collector.on("collect", async (i) => {
		if (i.customId === "next") {
			index++;
			if (index >= embeds.length) index = 0;
			await i.update({ embeds: [embeds[index].setFooter({ text: calculateFooter(index, originalEmbed[index]) })] });
		} else if (i.customId === "back") {
			index--;
			if (index < 0) index = embeds.length - 1;
			await i.update({ embeds: [embeds[index].setFooter({ text: calculateFooter(index, originalEmbed[index]) })] });
		} else if (i.customId === "stop") {
			await i.update({ embeds: [embeds[index]], components: [] });
			closedManually = true;
			collector.stop();
		}
	});

	collector.on("end", async () => {
		const footerEnd =
			originalEmbed[index].toJSON().footer && originalEmbed[index].toJSON().footer?.text
				? originalEmbed[index].toJSON().footer?.text + ` | ${closedManually ? "Page switcher closed" : "Page switcher closed due to timeout"}`
				: `${closedManually ? "Page switcher closed" : "Page switcher closed due to timeout"}`;

		await msg.edit({ embeds: [embeds[index].setFooter({ text: footerEnd })], components: [] });
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
