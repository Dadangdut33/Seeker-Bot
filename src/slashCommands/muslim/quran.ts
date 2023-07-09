import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import { embedRandomAyat, embedSurah } from "../../utils/commands/verse";
import { logger } from "../../logger";
import { interactionBtnPaginator } from "../../utils";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("quran")
		.setDescription("Read The holy Quran using quran.com and equran.id API")
		.addSubcommand((subcommand) => subcommand.setName("randomayat").setDescription("Get random ayat from the Quran using quran.com and equran.id API"))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("surah")
				.setDescription("Read a surah from the Quran using quran.com and equran.id API")
				.addIntegerOption((option) => option.setName("ke").setDescription("Surah number").setRequired(true).setMinValue(1).setMaxValue(114).setAutocomplete(true))
				.addIntegerOption((option) => option.setName("start-ayat").setDescription("Starting ayat").setRequired(false).setMinValue(1))
				.addIntegerOption((option) => option.setName("end-ayat").setDescription("Ending ayat").setRequired(false).setMinValue(1))
		),
	autocomplete: async (interaction) => {
		try {
			const subcommand = interaction.options.getSubcommand();
			if (subcommand === "surah") {
				const focusedValue = interaction.options.getFocused(true);
				const choices = [
					{ name: "1. Al-Fatihah (Pembuka, 7 ayat)", value: "1" },
					{ name: "2. Al-Baqarah (Sapi Betina, 286 ayat)", value: "2" },
					{ name: "3. Ali-Imran (Keluarga Imran, 200 ayat)", value: "3" },
					{ name: "4. An-Nisa' (Wanita, 176 ayat)", value: "4" },
					{ name: "5. Al-Ma'idah (Jamuan, 120 ayat)", value: "5" },
					{ name: "6. Al-An’am (Hewan Ternak, 165 ayat)", value: "6" },
					{ name: "7. Al-A'raf (Tempat yang Tertinggi, 206 ayat)", value: "7" },
					{ name: "8. Al-Anfal (Harta Rampasan Perang, 75 ayat)", value: "8" },
					{ name: "9. At-Taubah (Pengampunan, 129 ayat)", value: "9" },
					{ name: "10. Yunus (Nabi Yunus, 109 ayat)", value: "10" },
					{ name: "11. Hud (Nabi Hud, 123 ayat)", value: "11" },
					{ name: "12. Yusuf (Nabi Yusuf, 111 ayat)", value: "12" },
					{ name: "13. Ar-Ra’d (Guruh, 43 ayat)", value: "13" },
					{ name: "14. Ibrahim (Nabi Ibrahim, 52 ayat)", value: "14" },
					{ name: "15. Al-Hijr (Gunung Al Hijr, 99 ayat)", value: "15" },
					{ name: "16. An-Nahl (Lebah, 128 ayat)", value: "16" },
					{ name: "17. Al-Isra' (Perjalanan Malam, 111 ayat)", value: "17" },
					{ name: "18. Al-Kahfi (Penghuni-penghuni Gua, 110 ayat)", value: "18" },
					{ name: "19. Maryam (Maryam, 98 ayat)", value: "19" },
					{ name: "20. Ta Ha (Ta Ha, 135 ayat)", value: "20" },
					{ name: "21. Al-Anbiya' (Nabi-Nabi, 112 ayat)", value: "21" },
					{ name: "22. Al-Hajj (Haji, 78 ayat)", value: "22" },
					{ name: "23. Al-Mu'minun (Orang-orang mukmin, 118 ayat)", value: "23" },
					{ name: "24. An-Nur (Cahaya, 64 ayat)", value: "24" },
					{ name: "25. Al-Furqan (Pembeda, 77 ayat)", value: "25" },
					{ name: "26. Asy-Syu'ara' (Penyair, 227 ayat)", value: "26" },
					{ name: "27. An-Naml (Semut, 93 ayat)", value: "27" },
					{ name: "28. Al-Qasas (Kisah-kisah, 88 ayat)", value: "28" },
					{ name: "29. Al-Ankabut (Laba-laba, 69 ayat)", value: "29" },
					{ name: "30. Ar-Ruu (Bangsa Romawi, 60 ayat)", value: "30" },
					{ name: "31. Luqman (Keluarga Luqman, 34 ayat)", value: "31" },
					{ name: "32. As-Sajdah (Sajdah, 30 ayat)", value: "32" },
					{ name: "33. Al-Ahzab (Golongan-golongan yang Bersekutu, 73 ayat)", value: "33" },
					{ name: "34. Saba' (Kaum Saba', 54 ayat)", value: "34" },
					{ name: "35. Fatir (Pencipta, 45 ayat)", value: "35" },
					{ name: "36. Ya sin (Yaasiin, 83 ayat)", value: "36" },
					{ name: "37. Ash-Shaaffat (Barisan-barisan, 182 ayat)", value: "37" },
					{ name: "38. Shad (Shaad, 88 ayat)", value: "38" },
					{ name: "39. Az-Zumar (Rombongan-rombongan, 75 ayat)", value: "39" },
					{ name: "40. Ghafir (Yang Mengampuni, 85 ayat)", value: "40" },
					{ name: "41. Fushshilat (Yang Dijelaskan, 54 ayat)", value: "41" },
					{ name: "42. Asy-Syura (Musyawarah, 53 ayat)", value: "42" },
					{ name: "43. Az-Zukhruf (Perhiasan, 89 ayat)", value: "43" },
					{ name: "44. Ad-Dukhan (Kabut, 59 ayat)", value: "44" },
					{ name: "45. Al-Jaatsiyah (Yang Bertekuk Lutut, 37 ayat)", value: "45" },
					{ name: "46. Al-Ahqaf (Bukit-bukit Pasir, 35 ayat)", value: "46" },
					{ name: "47. Muhammad (Nabi Muhammad, 38 ayat)", value: "47" },
					{ name: "48. Al-Fath (Kemenangan, 29 ayat)", value: "48" },
					{ name: "49. Al-Hujurat (Kamar-kamar, 18 ayat)", value: "49" },
					{ name: "50. Qaaf (Qaaf, 45 ayat)", value: "50" },
					{ name: "51. Adz-dzariyat (Angin yang Menerbangkan, 60 ayat)", value: "51" },
					{ name: "52. Ath-Thuur (Bukit, 49 ayat)", value: "52" },
					{ name: "53. An-Najm (Bintang, 62 ayat)", value: "53" },
					{ name: "54. Al-Qamar (Bulan, 55 ayat)", value: "54" },
					{ name: "55. Ar-Rahman (Yang Maha Pemurah, 78 ayat)", value: "55" },
					{ name: "56. Al-Waqi'ah (Hari Kiamat, 96 ayat)", value: "56" },
					{ name: "57. Al-Hadid (Besi, 29 ayat)", value: "57" },
					{ name: "58. Al-Mujadilah (Wanita yang Mengajukan Gugatan, 22 ayat)", value: "58" },
					{ name: "59. Al-Hasyr (Pengusiran, 24 ayat)", value: "59" },
					{ name: "60. Al-Mumtahanah (Wanita yang Diuji, 13 ayat)", value: "60" },
					{ name: "61. Ash-Shaf (Satu Barisan, 14 ayat)", value: "61" },
					{ name: "62. Al-Jumu'ah (Hari Jum'at, 11 ayat)", value: "62" },
					{ name: "63. Al-Munafiqun (Orang-orang yang Munafik, 11 ayat)", value: "63" },
					{ name: "64. At-Taghabun (Hari Dinampakkan Kesalahan-kesalahan, 18 ayat)", value: "64" },
					{ name: "65. At-Talaq (Talak, 12 ayat)", value: "65" },
					{ name: "66. At-Tahrim (Mengharamkan, 12 ayat)", value: "66" },
					{ name: "67. Al-Mulk (Kerajaan, 30 ayat)", value: "67" },
					{ name: "68. Al-Qalam (Pena, 52 ayat)", value: "68" },
					{ name: "69. Al-Haqqah (Hari Kiamat, 52 ayat)", value: "69" },
					{ name: "70. Al-Ma'arij (Tempat Naik, 44 ayat)", value: "70" },
					{ name: "71. Nuh (Nabi Nuh, 28 ayat)", value: "71" },
					{ name: "72. Al-Jin (Jin, 28 ayat)", value: "72" },
					{ name: "73. Al-Muzzammil (Orang yang Berselimut, 20 ayat)", value: "73" },
					{ name: "74. Al-Muddathir (Orang yang Berkemul, 56 ayat)", value: "74" },
					{ name: "75. Al-Qiyamah (Kiamat, 40 ayat)", value: "75" },
					{ name: "76. Al-Insan (Manusia, 31 ayat)", value: "76" },
					{ name: "77. Al-Mursalat (Malaikat-Malaikat Yang Diutus, 50 ayat)", value: "77" },
					{ name: "78. An-Naba' (Berita Besar, 40 ayat)", value: "78" },
					{ name: "79. An-Nazi'at (Malaikat-Malaikat Yang Mencabut, 46 ayat)", value: "79" },
					{ name: "80. 'Abasa (Ia Bermuka Masam, 42 ayat)", value: "80" },
					{ name: "81. At-Takwir (Menggulung, 29 ayat)", value: "81" },
					{ name: "82. Al-Infitar (Terbelah, 19 ayat)", value: "82" },
					{ name: "83. Al-Mutaffifin (Orang-orang yang Curang, 36 ayat)", value: "83" },
					{ name: "84. Al-Insyiqaq (Terbelah, 25 ayat)", value: "84" },
					{ name: "85. Al-Buruj (Gugusan Bintang, 22 ayat)", value: "85" },
					{ name: "86. At-Tariq (Yang Datang di Malam Hari, 17 ayat)", value: "86" },
					{ name: "87. Al-A'la (Yang Paling Tinggi, 19 ayat)", value: "87" },
					{ name: "88. Al-Ghashiyah (Hari Pembalasan, 26 ayat)", value: "88" },
					{ name: "89. Al-Fajr (Fajar, 30 ayat)", value: "89" },
					{ name: "90. Al-Balad (Negeri, 20 ayat)", value: "90" },
					{ name: "91. Ash-Shams (Matahari, 15 ayat)", value: "91" },
					{ name: "92. Al-Lail (Malam, 21 ayat)", value: "92" },
					{ name: "93. Ad-Duha (Waktu Matahari Sepenggalahan Naik (Dhuha), 11 ayat)", value: "93" },
					{ name: "94. Al-Insyirah (Melapangkan, 8 ayat)", value: "94" },
					{ name: "95. At-Tin (Buah Tin, 8 ayat)", value: "95" },
					{ name: "96. Al-'Alaq (Segumpal Darah, 19 ayat)", value: "96" },
					{ name: "97. Al-Qadr (Kemuliaan, 5 ayat)", value: "97" },
					{ name: "98. Al-Bayyinah (Pembuktian, 8 ayat)", value: "98" },
					{ name: "99. Al-Zalzalah (Kegoncangan, 8 ayat)", value: "99" },
					{ name: "100. Al-'Adiyat (Berlari Kencang, 11 ayat)", value: "100" },
					{ name: "101. Al-Qari'ah (Hari Kiamat, 11 ayat)", value: "101" },
					{ name: "102. At-Takathur (Bermegah-megahan, 8 ayat)", value: "102" },
					{ name: "103. Al-'Asr (Masa, 3 ayat)", value: "103" },
					{ name: "104. Al-Humazah (Pengumpat, 9 ayat)", value: "104" },
					{ name: "105. Al-Fil (Gajah, 5 ayat)", value: "105" },
					{ name: "106. Quraysh (Suku Quraisy, 4 ayat)", value: "106" },
					{ name: "107. Al-Ma'un (Barang-barang yang Berguna, 7 ayat)", value: "107" },
					{ name: "108. Al-Kauthar (Nikmat yang Berlimpah, 3 ayat)", value: "108" },
					{ name: "109. Al-Kafirun (Orang-orang Kafir, 6 ayat)", value: "109" },
					{ name: "110. An-Nasr (Pertolongan, 3 ayat)", value: "110" },
					{ name: "111. Al-Masad (Gejolak Api, 5 ayat)", value: "111" },
					{ name: "112. Al-Ikhlas (Ikhlas, 4 ayat)", value: "112" },
					{ name: "113. Al-Falaq (Waktu Subuh, 5 ayat)", value: "113" },
					{ name: "114. An-Nas (Umat Manusia, 6 ayat)", value: "114" },
				];

				let filtered: { name: string; value: string }[] = [];
				for (let i = 0; i < choices.length; i++) {
					const choice = choices[i];
					if (choice.name.includes(focusedValue.value)) filtered.push(choice);
				}

				// filter 25 choices max because of discord limit
				filtered = filtered.slice(0, 25);

				// if interaction is target, remove auto
				if (focusedValue.name === "target") {
					filtered = filtered.filter((choice) => choice.value !== "auto");
				}

				await interaction.respond(filtered);
			}
		} catch (error) {
			logger.error(`${error}`);
		}
	},
	execute: async (interaction) => {
		await interaction.deferReply();
		const command = interaction.options.getSubcommand();

		if (command === "surah") {
			const surah = interaction.options.getInteger("ke", true);
			const startAyat = interaction.options.getInteger("start-ayat", false);
			const endAyat = interaction.options.getInteger("end-ayat", false);

			const data = await embedSurah(surah, startAyat, endAyat);
			if (!data) {
				await interaction.editReply({ content: "API Failed to respond on getting surah" });
				logger.error("API Failed to respond on getting surah");
				return;
			}

			const component_func = (index: number) => {
				if (!data[index].toJSON().title) return null;

				// ayat is located in the title of the embed with format like this Ayat ke-xxx
				const ayat = data[index].toJSON().title?.split("-")[1];
				const tafsirButton = new ButtonBuilder().setCustomId(`tafsir-${surah}:${ayat}`).setStyle(1).setLabel("Tafsir");
				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(tafsirButton);
				return row;
			};

			interactionBtnPaginator(interaction, data, 60, { components_function: component_func }); // 60 minutes
		} else {
			const data = await embedRandomAyat();
			if (!data) {
				await interaction.editReply({ content: "API Failed to respond on random ayat" });
				logger.error("API Failed to respond on random ayat");
				return;
			}

			// Surah number and ayat is in the title of the first embed with format like this [surah:number] xxx (xxx) - xxx
			// get each of it
			const surahNumber = data[0].data.title?.split(" ")[0].split(":")[0].replace("[", ""),
				ayatNumber = data[0].data.title?.split(" ")[0].split(":")[1].replace("]", "");

			// add button to get the tafsir
			const tafsirButton = new ButtonBuilder().setCustomId(`tafsir-${surahNumber}:${ayatNumber}`).setStyle(1).setLabel("Tafsir");
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(tafsirButton);

			await interaction.editReply({ embeds: data, components: [row] });
		}
	},
};

export default slashCommands;
