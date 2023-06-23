import axios from "axios";
import { logger } from "../../logger";

export async function getWallpaper() {
	try {
		const { data }: any = await axios.get("http://api.nekos.fun:8080/api/wallpapers", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data;
	} catch (error) {
		logger.error(error);
		return false;
	}
}

export async function getAnimeImgURLV2(action: "hug" | "poke" | "smug" | "slap" | "pat" | "laugh") {
	try {
		const { data }: any = await axios.get("http://api.nekos.fun:8080/api/" + action.toLowerCase(), {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data.image;
	} catch (error) {
		logger.error(error);
		return false;
	}
}

export async function getAdvice() {
	try {
		const { data }: any = await axios.get("https://api.adviceslip.com/advice");

		return data.slip ? data.slip.advice : false;
	} catch (error) {
		logger.error(error);
		return false;
	}
}
