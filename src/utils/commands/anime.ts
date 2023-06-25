import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import malScraper, { AnimeEpisodesDataModel, MangaSearchModel } from "mal-scraper";

export const checkIfStaff = (toBeCheck: string) => {
	return ["Director", "Original Creator", "Producer", "Music", "Sound Director", "Series Composition"].includes(toBeCheck);
};

export const malAnimeSearch = async (query: string) => {
	const data = await malScraper.getInfoFromName(query);

	if (!data) return null;

	// -----------------------------
	// get chars and staff
	let animeChar: string[] = [],
		animeStaff: string[] = [];

	if (!data.staff || data.staff.length === 0) animeStaff = [`No staff for this anime have been added to this title.`];
	else data.staff.forEach((staff) => animeStaff.push(`• ${staff.name} - ${staff.role ? staff.role : "-"}`));

	if (!data.characters || data.characters.length === 0) animeChar = [`No characters for this anime have been added to this title.`];
	else data.characters.forEach((char) => animeChar.push(`• ${char.name} (${char.role}) 🔊: ${char.seiyuu.name ? char.seiyuu.name : "-"}`));

	// Sometimes the char is the staff so if the first array of each is the same
	if (data.characters && data.characters[0] && data.staff && data.staff[0]) {
		// No Staff, sometimes the role is character's role
		if (data.characters[0].name === data.staff[0].name && (data.staff[0].role === "Main" || data.staff![0].role === "Supporting") && animeStaff.length === 1)
			animeStaff = [`No staff for this anime have been added to this title.`];

		// No Character, sometimes the staff is the char
		if (data.characters[0].name === data.staff[0].name && checkIfStaff(data.staff[0].role!) && animeChar.length === 1)
			animeChar = [`No characters or voice actors have been added to this title.`];
	}

	// -----------------------------
	let embed = new EmbedBuilder()
		.setColor("#2E51A2")
		.setAuthor({
			name: `${data.englishTitle ? data.englishTitle : data.title} | ${data.type ? data.type : "N/A"}`,
			iconURL: data.picture,
			url: data.url,
		})
		.setDescription(data.synopsis ? (data.synopsis.length > 2048 ? data.synopsis.slice(0, 2045) + "..." : data.synopsis) : "No synopsis available.") // 2048 is the max
		.setFields([
			{
				name: "Japanese Name",
				value: `${(data as AnimeEpisodesDataModel).japaneseTitle ? `${(data as AnimeEpisodesDataModel).japaneseTitle} (${data.title})` : data.title}`,
				inline: false,
			},
			{
				name: "Synonyms",
				value: `${data.synonyms[0] === "" ? "N/A" : data.synonyms.join(", ")}`,
				inline: false,
			},
			{
				name: "Genres",
				value: `${data.genres ? (data.genres![0].length > 0 ? data.genres.join(", ") : "N/A") : "N/A"}`,
				inline: false,
			},
			{
				name: "Age Rating",
				value: `${data.rating ? data.rating : "N/A"}`,
				inline: true,
			},
			{
				name: "Source",
				value: `${data.source ? data.source : "N/A"}`,
				inline: true,
			},
			{
				name: "Status",
				value: `${data.status ? data.status : "N/A"}`,
				inline: true,
			},
			{
				name: `User Count/Favorite`,
				value: `${data.members ? data.members : "N/A"}/${data.favorites ? data.favorites : "N/A"}`,
				inline: true,
			},
			{
				name: "Average Score",
				value: `${data.score ? data.score : "N/A"} (${data.scoreStats ? data.scoreStats : "N/A"})`,
				inline: true,
			},
			{
				name: "Rating Rank/Popularity Rank`",
				value: `${data.ranked ? data.ranked : "N/A"}/${data.popularity ? data.popularity : "N/A"}`,
				inline: true,
			},
			{
				name: "Episodes/Duration",
				value: `${data.episodes ? data.episodes : "N/A"}/${data.duration ? data.duration : "N/A"}`,
				inline: true,
			},
			{
				name: "Broadcast Date",
				value: `${data.aired ? data.aired : "N/A"}`,
				inline: true,
			},
			{
				name: "Studios",
				value: `${data.studios!.length > 0 ? data.studios!.join(", ") : "N/A"}`,
				inline: true,
			},
			{
				name: "Producers",
				value: `${data.producers!.length > 0 ? data.producers!.join(", ") : "N/A"}`,
				inline: true,
			},
			{
				name: "Staff",
				value: `${animeStaff.join("\n")}`,
				inline: false,
			},
			{
				name: "Characters",
				value: `${animeChar.join("\n")}`,
				inline: false,
			},
		])
		.setFooter({ text: `Via Myanimelist.net` })
		.setTimestamp()
		.setThumbnail(data.picture ? data.picture : ``);

	const component = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setLabel("MyAnimeList").setStyle(ButtonStyle.Link).setURL(data.url),
		new ButtonBuilder()
			.setLabel("Search on 9Anime")
			.setStyle(ButtonStyle.Link)
			.setURL(`https://9anime.to/filter?keyword=${data.title.replace(/ /g, "+")}`),
		new ButtonBuilder()
			.setLabel("Search on Zoro")
			.setStyle(ButtonStyle.Link)
			.setURL(`https://zoro.to/search?keyword=${data.title.replace(/ /g, "+")}`),
		new ButtonBuilder()
			.setLabel("Search on Nyaa")
			.setStyle(ButtonStyle.Link)
			.setURL(`https://nyaa.si/?f=0&c=0_0&q=${data.title.replace(/ /g, "+")}`),
		new ButtonBuilder()
			.setLabel(data.trailer ? "Promotional Video" : "PV not available")
			.setStyle(ButtonStyle.Link)
			.setURL(data.trailer ? data.trailer : "https://google.com")
			.setDisabled(!data.trailer)
	);

	return { embed, component };
};

export const malMangaEmbed = (manga: MangaSearchModel) => {
	const embed = new EmbedBuilder()
		.setColor("#2E51A2")
		.setAuthor({ name: `${manga.title} | ${manga.type}`, iconURL: manga.thumbnail, url: manga.url })
		.setDescription(manga.shortDescription ? manga.shortDescription : "-")
		.addFields([
			{
				name: `Type`,
				value: `${manga.type ?? "-"}`,
				inline: true,
			},
			{
				name: `Volumes`,
				value: `${manga.vols ?? "-"}`,
				inline: true,
			},
			{
				name: `Chapters`,
				value: `${manga.nbChapters ?? "-"}`,
				inline: true,
			},
			{
				name: `Scores`,
				value: `${manga.score ?? "-"}`,
				inline: true,
			},
			{
				name: `Start / End Date`,
				value: `${manga.startDate ? manga.startDate : "-"} / ${manga.endDate ? manga.endDate : "-"}`,
				inline: true,
			},
			{
				name: `Members`,
				value: `${manga.members ?? "-"}`,
				inline: true,
			},
		])
		.setFooter({ text: `Data Fetched From Myanimelist.net` })
		.setTimestamp()
		.setThumbnail(manga.thumbnail);

	const component = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setLabel("MyAnimeList").setStyle(ButtonStyle.Link).setURL(manga.url),

		new ButtonBuilder()
			.setLabel("Search on Mangadex")
			.setStyle(ButtonStyle.Link)
			.setURL(`https://mangadex.org/titles?q=${manga.title.replace(/ /g, "+")}`),
		new ButtonBuilder()
			.setLabel("Search on Nyaa")
			.setStyle(ButtonStyle.Link)
			.setURL(`https://nyaa.si/?f=0&c=3_0&q=${manga.title.replace(/ /g, "+")}`),
		new ButtonBuilder()
			.setLabel(manga.video ? "Promotional Video" : "PV not available")
			.setStyle(ButtonStyle.Link)
			.setURL(manga.video ? manga.video : "https://google.com")
			.setDisabled(!manga.video)
	);

	return { embed, component };
};
