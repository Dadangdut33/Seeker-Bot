import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "../../types";
import axios from "axios";

const slashCommands: ISlashCommand = {
	command: new SlashCommandBuilder()
		.setName("sauce")
		.setDescription("Get an image source from SauceNao. Must provide either an image, image url, or message id")
		.addStringOption((option) => option.setName("url-or-id").setDescription("Image URL or message ID (must be in the same channel of the message)").setRequired(false))
		.addAttachmentOption((option) =>
			option.setName("image-upload").setDescription("Image to search by uploading image (Will prioritize this if set)").setRequired(false)
		),

	execute: async (interaction) => {
		const replaceChar: any = { "/": "%2F", ":": "%3A" };
		let queryImageUrlOrId = interaction.options.getString("url-or-id")! || null,
			queryImage = interaction.options.getAttachment("image-upload") ? interaction.options.getAttachment("image-upload")?.url : null,
			link;

		await interaction.deferReply();
		try {
			interaction.editReply(`**Checking arguments...**`);
			if (!queryImageUrlOrId && !queryImage) return interaction.editReply(`**Please either provide an image (upload), image url, or message id**`);
			if (queryImage) {
				interaction.editReply(`**Got image uploaded**`);
				queryImageUrlOrId = queryImage;
			} else {
				try {
					interaction.editReply(`**Checking if query is an id...**`);
					// check if query is an id
					const message = await interaction.channel?.messages.fetch(queryImageUrlOrId!);
					if (message && message.attachments.size > 0) {
						queryImageUrlOrId = message.attachments.first()!.url; // fetched msg id contains an image
						interaction.editReply(`**Got image attachment from message id**`);
					} else if (message && message.content) {
						// got fetched msg but no attachment. Check if the msg contains url
						queryImageUrlOrId = message.content;

						// match img url
						let regex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))/gi;
						let match = regex.exec(queryImageUrlOrId);
						if (match) {
							queryImageUrlOrId = match[0];
							interaction.editReply(`**Got image url from message id**`);
						}
					} else interaction.editReply(`**Query is not an id...**`);
				} catch (error) {}
			}

			interaction.editReply(`**Fetching data from SauceNao...**`);
			link = `https://saucenao.com/search.php?db=999&output_type=2&url=${queryImageUrlOrId!.split("?")[0].replace(/[:/]/g, (m) => replaceChar[m])}`;
			let { data } = await axios.get(link + `&api_key=${process.env.SAUCENAO_API_KEY}`);
			if (data.header.status !== 0) return interaction.editReply(`**Error: ${data.header.message}**`);

			// limit the results to 10
			let results = data.results,
				limit = results.length > 10 ? 10 : results.length,
				results_array = []; // [0] = img name, [1] = link img, [3] = similarity percentage

			// map array
			for (let i = 0; i < limit; i++)
				results_array.push([
					results[i].header.index_name,
					results[i].data.ext_urls ? results[i].data.ext_urls[0] : link.replace("output_type=2", "output_type=0"),
					results[i].header.similarity,
				]);

			// remove duplicate, furaffinity, percentage < 50
			results_array = results_array.filter(
				(v, i, a) =>
					a.findIndex((t) => t[0] === v[0]) === i && !v[0].toLowerCase().includes("hentai") && !v[0].toLowerCase().includes("furaffinity") && parseInt(v[2]) > 49
			);

			const embed = new EmbedBuilder() // create embed
				.setColor("#0096fa")
				.setAuthor({
					name: "SauceNao",
					url: link.replace("output_type=2", "output_type=0"),
					iconURL: "https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png",
				})
				.setTitle(`Found ${results_array.length} results`)
				.setImage(queryImageUrlOrId)
				.setFooter({ text: `Some results might be filtered.` });

			if (results_array.length === 0)
				embed.addFields([{ name: `No Result found`, value: `Results found has less than 50% similarity. You can check full result for more info.` }]); // no result found
			else embed.addFields([{ name: `Top Result (${results_array[0][2]}%)`, value: `[${results_array[0][0]}](${results_array[0][1]})` }]); // add top result

			// more than 1 result
			if (results_array.length > 1) {
				// loop add 5 item per field
				for (let i = 1; i < results_array.length; i += 5) {
					embed.addFields([
						{
							name: `Other Results (Might not be accurate)`,
							value: results_array
								.slice(i, i + 5)
								.map((v) => `- [${v[0]} (${v[2]}%)](${v[1]})`)
								.join("\n"),
						},
					]);
				}
			}

			return interaction.editReply({
				embeds: [embed],
				content: "",
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "See Full Result",
								style: 5,
								url: link.replace("output_type=2", "output_type=0"),
							},
						],
					},
				],
			});
		} catch (error) {
			console.log(error);
			return interaction.editReply(`**Unexpected error: ${error}**`);
		}
	},
};

export default slashCommands;
