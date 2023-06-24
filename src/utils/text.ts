import { Chance } from "chance";

export const autist_text = (text: string) => {
	return text
		.split("")
		.map((v) => (Chance().bool() ? v.toUpperCase() : v.toLowerCase()))
		.join("");
};

export const capitalizeFirstLetter = (myString: string) => {
	return myString.charAt(0).toUpperCase() + myString.slice(1);
};

export const hasNumber = (myString: string) => {
	return /\d/.test(myString);
};

export const hasEmoji = (myString: string) => {
	return /(:[^:s]+:|<:[^:s]+:[0-9]+>|<a:[^:s]+:[0-9]+>)/g.test(myString);
};

export const hasLink = (myString: string) => {
	return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(myString);
};

export const reverseString = (str: string) => {
	return str.split("").reverse().join("");
};

export const capitalizeTheFirstLetterOfEachWord = (words: string) => {
	let separateWord = words.toLowerCase().split(" ");
	for (let i = 0; i < separateWord.length; i++) {
		separateWord[i] = separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
	}
	return separateWord.join(" ");
};

export const toTitleCase = (str: string) => {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
};
