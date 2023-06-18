import axios from "axios";
import { IEquranIdSurah, IEquranIdSurahTafsir, IQuranComVerse } from "../types";
import { EmbedBuilder } from "discord.js";
const version = "v4";

export const randomAyat = async () => {
	let req_1 = await axios.get(`https://api.quran.com/api/${version}/verses/random?words=true`);
	if (req_1.data.status == "error") return null;

	let req_2 = await axios.get(`https://equran.id/api/v2/surat/${req_1.data.verse.verse_key.split(":")[0]}`);
	if (req_2.data.status == "error") return null;

	let req_3 = await axios.get(`https://equran.id/api/v2/tafsir/${req_1.data.verse.verse_key.split(":")[0]}`);
	if (req_3.data.status == "error") return null;

	return { 1: req_1.data.verse as IQuranComVerse, 2: req_2.data.data as IEquranIdSurah, 3: req_3.data.data as IEquranIdSurahTafsir };
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
