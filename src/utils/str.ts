export function capitalizeFirstLetter(myString: string) {
	return myString.charAt(0).toUpperCase() + myString.slice(1);
}

export function hasNumber(myString: string) {
	return /\d/.test(myString);
}

export function reverseString(str: string) {
	return str.split("").reverse().join("");
}

export function toTitleCase(str: string) {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
}
