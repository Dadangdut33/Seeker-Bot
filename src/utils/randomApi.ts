import axios from "axios";

export class RandomApi {
	async getMeme() {
		const { data }: any = await axios.get("https://apis.duncte123.me/meme", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data;
	}

	async getJoke() {
		const { data }: any = await axios.get("https://apis.beta.duncte123.me/joke", {
			headers: {
				"Content-Type": "application/json",
			},
		}); //https://apis.beta.duncte123.me/joke https://apis.duncte123.me/joke

		return data;
	}

	async getKitsune() {
		const { data }: any = await axios.get("https://neko-love.xyz/api/v1/kitsune", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data;
	}

	async getNeko() {
		const { data }: any = await axios.get("https://neko-love.xyz/api/v1/neko", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data;
	}

	async getWallpaper() {
		const { data }: any = await axios.get("http://api.nekos.fun:8080/api/wallpapers", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data;
	}

	async getAnimeImgURL(action: "neko" | "kitsune" | "pat" | "hug" | "waifu" | "cry" | "kiss" | "slap" | "smug" | "punch") {
		const { data }: any = await axios.get("https://neko-love.xyz/api/v1/" + action.toLowerCase(), {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data.url;
	}

	async getAnimeImgURLV2(action: "kiss" | "lick" | "hug" | "baka" | "cry" | "poke" | "smug" | "slap" | "tickle" | "pat" | "laugh" | "feed" | "cuddle") {
		const { data }: any = await axios.get("http://api.nekos.fun:8080/api/" + action.toLowerCase(), {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data.image;
	}

	async getAdvice() {
		const { data }: any = await axios.get("https://api.adviceslip.com/advice");

		return data.slip ? data.slip.advice : false;
	}

	async getShip(chara1: string, chara2: string) {
		const { data }: any = await axios.get("https://apis.beta.duncte123.me/love/" + chara1 + `/` + chara2);

		return data;
	}
}
