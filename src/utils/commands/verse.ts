import axios from "axios";
import { IEquranIdSurah, IEquranIdSurahTafsir, IQuranComVerse } from "../../types";
import { EmbedBuilder } from "discord.js";
import { htmlToText } from "html-to-text";
const version_quran_com = "v4",
	version_equran_id = "v2";

export const randomAyat = async () => {
	let req_1 = await axios.get(`https://api.quran.com/api/${version_quran_com}/verses/random?words=true`);
	if (req_1.data.status == "error") return null;

	let req_2 = await axios.get(`https://equran.id/api/${version_equran_id}/surat/${req_1.data.verse.verse_key.split(":")[0]}`);
	if (req_2.data.status == "error") return null;

	return { 1: req_1.data.verse as IQuranComVerse, 2: req_2.data.data as IEquranIdSurah };
};

export const getTafsir = async (surah: number) => {
	let req = await axios.get(`https://equran.id/api/v2/tafsir/${surah}`);
	if (req.data.status == "error") return null;

	return req.data.data as IEquranIdSurahTafsir;
};

export const listSurah = async () => {
	let req = await axios.get(`https://equran.id/api/${version_equran_id}/surat`);
	if (req.data.status == "error") return null;

	return req.data.data as IEquranIdSurah[];
};

export const getSurah = async (surah: number) => {
	let req = await axios.get(`https://equran.id/api/${version_equran_id}/surat/${surah}`);
	if (req.data.status == "error") return null;

	return req.data.data as IEquranIdSurah;
};

export const embedRandomAyat = async () => {
	const data = await randomAyat();
	if (!data) return null;

	const quranCom = data[1],
		equran_surat = data[2],
		audioLists = [];

	// audio is only up to 5
	for (let i = 1; i <= 5; i++) {
		let val = equran_surat.ayat[i].audio[`0${i}`];
		audioLists.push(`- [${val.split("/")[val.split("/").length - 2]}](${val})`);
	}

	let embedAyat = [
		new EmbedBuilder()
			.setTitle(`[${quranCom.verse_key}] Q.S ${equran_surat.namaLatin} (${equran_surat.nama}) - ${equran_surat.arti}`)
			.setDescription(equran_surat.ayat[quranCom.verse_number - 1].teksArab)
			.addFields([{ name: "Latin", value: equran_surat.ayat[quranCom.verse_number - 1].teksLatin }]),
		new EmbedBuilder().setDescription(`**Artinya**\n${equran_surat.ayat[quranCom.verse_number - 1].teksIndonesia}`).addFields([
			{
				name: "Audio",
				value: audioLists.join("\n"),
				inline: true,
			},
			{
				name: "Read Full Surah",
				value: `- [[Quran.com]](https://quran.com/${equran_surat.nomor}?startingVerse=${
					quranCom.verse_number
				})\n- [[quran.kemenag]](https://quran.kemenag.go.id/quran/per-ayat/surah/${equran_surat.nomor}?from=${equran_surat.ayat[0].nomorAyat}&to${
					equran_surat.ayat[equran_surat.ayat.length - 1].nomorAyat
				}}#ayat-${equran_surat.ayat[quranCom.verse_number - 1].nomorAyat})`,
				inline: true,
			},
		]),
	];

	return embedAyat;
};

export const embedTafsir = async (surah: number, ayat: number, title: boolean = false, full_info: boolean = false) => {
	const data = await getTafsir(surah);
	if (!data) return null;

	const infoEmbed = [
			new EmbedBuilder()
				.setTitle(`Tafsir Q.S ${data.namaLatin} (${data.nama}) - ${data.arti} ayat ke ${ayat}`)
				.setDescription(htmlToText(data.deskripsi))
				.setFields([
					{
						name: "Surah nomor",
						value: data.nomor.toString(),
						inline: true,
					},
					{
						name: "Jumlah ayat",
						value: data.jumlahAyat.toString(),
						inline: true,
					},
					{
						name: "Turun di",
						value: data.tempatTurun,
						inline: true,
					},
				]),
		],
		dataTafsir = data.tafsir[ayat - 1].teks;

	let start = 0,
		limit = 1900, // limit because discord max character per send message is 6000
		end = limit; // Cut it to the limit
	const loop = Math.ceil(dataTafsir.length / limit);
	for (let i = 0; i < loop; i++) {
		let toAdd = new EmbedBuilder().setDescription(dataTafsir.slice(start, end)); // i dont care about the cut up words, spend too much trying but still not working
		start += limit;
		end += limit;
		infoEmbed.push(toAdd);
	}

	return infoEmbed;
};

export const embedSurah = async (surah: number, start?: number | null, end?: number | null) => {
	const data = await getSurah(surah);
	if (!data) return null;

	let ayatData = data.ayat;

	const embedLists = [
		new EmbedBuilder()
			.setTitle(`Q.S ${data.namaLatin} (${data.nama}) - ${data.arti}`)
			.setDescription(htmlToText(data.deskripsi))
			.setFields([
				{
					name: "Surah nomor",
					value: data.nomor.toString(),
					inline: true,
				},
				{
					name: "Jumlah ayat",
					value: data.jumlahAyat.toString(),
					inline: true,
				},
				{
					name: "Turun di",
					value: data.tempatTurun,
					inline: true,
				},
			]),
	];

	if (start && end) {
		// slice data by start and end
		if (end > data.jumlahAyat) end = data.jumlahAyat; // check end
		ayatData = data.ayat.slice(start - 1, end);
		embedLists[0].setTitle(`Q.S ${data.namaLatin} (${data.nama}) - ${data.arti} ayat ke ${start} sampai ${end}`);
	} else if (start && !end) {
		// slice the start to the end of the data
		ayatData = data.ayat.slice(start - 1, data.ayat.length);
		embedLists[0].setTitle(`Q.S ${data.namaLatin} (${data.nama}) - ${data.arti} ayat ke ${start} sampai ${data.jumlahAyat}`);
	} else if (!start && end) {
		// slice the start to the end of the data
		if (end > data.jumlahAyat) end = data.jumlahAyat; // check end
		ayatData = data.ayat.slice(0, end);
		embedLists[0].setTitle(`Q.S ${data.namaLatin} (${data.nama}) - ${data.arti} ayat ke 1 sampai ${end}`);
	}

	ayatData.forEach((val, index) => {
		let toPush: EmbedBuilder[] = [];
		// set the ayat in description
		let firstLoop = Math.ceil(val.teksArab.length / 2048);
		for (let i = 0; i < firstLoop; i++) {
			toPush.push(
				new EmbedBuilder()
					.setAuthor({ name: `Q.S ${data.namaLatin} (${data.nama}) - ${data.arti}` })
					.setTitle(`Ayat ke-${data.ayat[index].nomorAyat}`)
					.setDescription(val.teksArab.slice(i * 2048, (i + 1) * 2048))
			);
		}

		// latin loop
		let loop = Math.ceil(val.teksLatin.length / 1024);

		// also modify currently stored data in tempStore
		for (let i = 0; i < toPush.length; i++) {
			for (let j = 0; j < loop; j++) {
				toPush[i].addFields([
					{
						name: i === 0 ? "Latin" : `Latin [${i + 2}]`,
						value: val.teksLatin.slice(j * 1024, (j + 1) * 1024),
						inline: false,
					},
				]);
			}
		}

		// artinya loop
		loop = Math.ceil(val.teksIndonesia.length / 1024);

		// also modify currently stored data in tempStore
		for (let i = 0; i < toPush.length; i++) {
			for (let j = 0; j < loop; j++) {
				toPush[i].addFields([
					{
						name: i === 0 ? "Artinya" : `Artinya [${i + 2}]`,
						value: val.teksIndonesia.slice(i * 1024, (i + 1) * 1024),
						inline: false,
					},
				]);
			}
		}

		// add to embedLists
		embedLists.push(...toPush);
		toPush = []; // reset
	});

	return embedLists;
};
