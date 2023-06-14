const punycode = require("punycode");

let map = {
	" ": " ",
	"⅋": "&",
	"%": ["%"],
	"０": ["0"],
	"１": ["1"],
	"２": ["2"],
	"３": ["3"],
	"４": ["4"],
	"５": ["5"],
	"６": ["6"],
	"７": ["7"],
	"８": ["8"],
	"９": ["9"],
	"＜": ["<"],
	"＞": [">"],
	"【": ["["],
	"】": ["]"],
	"✩": ["*"],
	"(": ["("],
	")": [")"],
	"𝓪": ["a", "A"],
	"𝒷": ["b", "B"],
	"𝓬": ["c", "C"],
	"𝒹": ["d", "D"],
	"𝒆": ["e", "E"],
	"𝒻": ["f", "F"],
	"𝓰": ["g", "G"],
	"𝒽": ["h", "H"],
	"𝒾": ["i", "I"],
	"𝒿": ["j", "J"],
	"𝓀": ["k", "K"],
	"𝓁": ["l", "L"],
	"𝓂": ["m", "M"],
	"𝓃": ["n", "N"],
	"𝑜": ["o", "O"],
	"𝓅": ["p", "P"],
	"𝓆": ["q", "Q"],
	"𝓇": ["r", "R"],
	"𝓈": ["s", "S"],
	"𝓉": ["t", "T"],
	"𝓊": ["u", "U"],
	"𝓋": ["v", "V"],
	"𝓌": ["w", "W"],
	"𝓍": ["x", "X"],
	"𝓎": ["y", "Y"],
	"𝓏": ["z", "Z"],
	";": [";"],
	":": [":"],
	"'": ["'"],
	'"': ['"'],
	"\\": ["\\"],
	"/": ["/"],
	"|": ["|"],
	"=": ["="],
	"+": ["+"],
	"-": ["-"],
	_: ["_"],
	"^": ["^"],
	"!": ["!"],
	"`": ["`"],
	".": ["."],
	",": [","],
};

function getKeyByValue(object: any, value: any) {
	let foundKey = "";
	Object.keys(object).find((key) => {
		for (let i in object[key]) {
			if (punycode.ucs2.decode(object[key][i]).toString().normalize() === value.toString().normalize()) {
				foundKey = key;
			}
		}
	});
	return foundKey;
}

export function fancy(characterString: string) {
	let fanciedString = "";
	let punycodeArray = punycode.ucs2.decode(characterString);
	for (let i = 0; i < punycodeArray.length; i++) {
		let key = getKeyByValue(map, punycodeArray[i]);

		// @ts-ignore
		if (key == isNaN) key = punycodeArray[i];

		fanciedString += key;
	}

	return fanciedString;
}
