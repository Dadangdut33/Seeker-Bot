// original from https://www.npmjs.com/package/syllable
// modified to fit needs
const pluralize = require("pluralize");
const normalize = require("normalize-strings");
import { problematic } from "./problematic";

let own = {}.hasOwnProperty;

// Two expressions of occurrences which normally would be counted as two
// syllables, but should be counted as one.
let EXPRESSION_MONOSYLLABIC_ONE = new RegExp(
	[
		"awe($|d|so)",
		"cia(?:l|$)",
		"tia",
		"cius",
		"cious",
		"[^aeiou]giu",
		"[aeiouy][^aeiouy]ion",
		"iou",
		"sia$",
		"eous$",
		"[oa]gue$",
		".[^aeiuoycgltdb]{2,}ed$",
		".ely$",
		"^jua",
		"uai",
		"eau",
		"^busi$",
		"(?:[aeiouy](?:" + ["[bcfgklmnprsvwxyz]", "ch", "dg", "g[hn]", "lch", "l[lv]", "mm", "nch", "n[cgn]", "r[bcnsv]", "squ", "s[chkls]", "th"].join("|") + ")ed$)",
		"(?:[aeiouy](?:" + ["[bdfklmnprstvy]", "ch", "g[hn]", "lch", "l[lv]", "mm", "nch", "nn", "r[nsv]", "squ", "s[cklst]", "th"].join("|") + ")es$)",
	].join("|"),
	"g"
);

let EXPRESSION_MONOSYLLABIC_TWO = new RegExp(
	"[aeiouy](?:" + ["[bcdfgklmnprstvyz]", "ch", "dg", "g[hn]", "l[lv]", "mm", "n[cgns]", "r[cnsv]", "squ", "s[cklst]", "th"].join("|") + ")e$",
	"g"
);

// Four expression of occurrences which normally would be counted as one
// syllable, but should be counted as two.
let EXPRESSION_DOUBLE_SYLLABIC_ONE = new RegExp(
	"(?:" +
		[
			"([^aeiouy])\\1l",
			"[^aeiouy]ie(?:r|s?t)",
			"[aeiouym]bl",
			"eo",
			"ism",
			"asm",
			"thm",
			"dnt",
			"snt",
			"uity",
			"dea",
			"gean",
			"oa",
			"ua",
			"react?",
			"orbed", // Cancel `'.[^aeiuoycgltdb]{2,}ed$',`
			"shred", // Cancel `'.[^aeiuoycgltdb]{2,}ed$',`
			"eings?",
			"[aeiouy]sh?e[rs]",
		].join("|") +
		")$",
	"g"
);

let EXPRESSION_DOUBLE_SYLLABIC_TWO = new RegExp(["creat(?!u)", "[^gq]ua[^auieo]", "[aeiou]{3}", "^(?:ia|mc|coa[dglx].)", "^re(app|es|im|us)", "(th|d)eist"].join("|"), "g");

let EXPRESSION_DOUBLE_SYLLABIC_THREE = new RegExp(
	["[^aeiou]y[ae]", "[^l]lien", "riet", "dien", "iu", "io", "ii", "uen", "[aeilotu]real", "real[aeilotu]", "iell", "eo[^aeiou]", "[aeiou]y[aeiou]"].join("|"),
	"g"
);

let EXPRESSION_DOUBLE_SYLLABIC_FOUR = /[^s]ia/;

// Expression to match single syllable pre- and suffixes.
let EXPRESSION_SINGLE = new RegExp(
	[
		"^(?:" + ["un", "fore", "ware", "none?", "out", "post", "sub", "pre", "pro", "dis", "side", "some"].join("|") + ")",
		"(?:" + ["ly", "less", "some", "ful", "ers?", "ness", "cians?", "ments?", "ettes?", "villes?", "ships?", "sides?", "ports?", "shires?", "[gnst]ion(?:ed|s)?"].join("|") + ")$",
	].join("|"),
	"g"
);

// Expression to match double syllable pre- and suffixes.
let EXPRESSION_DOUBLE = new RegExp(
	[
		"^" +
			"(?:" +
			[
				"above",
				"anti",
				"ante",
				"counter",
				"hyper",
				"afore",
				"agri",
				"infra",
				"intra",
				"inter",
				"over",
				"semi",
				"ultra",
				"under",
				"extra",
				"dia",
				"micro",
				"mega",
				"kilo",
				"pico",
				"nano",
				"macro",
				"somer",
			].join("|") +
			")",
		"(?:fully|berry|woman|women|edly|union|((?:[bcdfghjklmnpqrstvwxz])|[aeiou])ye?ing)$",
	].join("|"),
	"g"
);

// Expression to match triple syllable suffixes.
let EXPRESSION_TRIPLE = /(creations?|ology|ologist|onomy|onomist)$/g;

// Wrapper to support multiple word-parts (GH-11).
/**
 * Syllable count
 *
 * @param {string} value
 * @returns {number}
 */
export function syllable(value: string) {
	let values = normalize(String(value))
		.toLowerCase()
		// Remove apostrophes.
		.replace(/['’]/g, "")
		// Split on word boundaries.
		.split(/\b/g);
	let index = -1;
	let sum = 0;

	while (++index < values.length) {
		// Remove non-alphabetic characters from a given value.
		sum += one(values[index].replace(/[^a-z]/g, ""));
	}

	return sum;
}

/**
 * Get syllables in a given value.
 *
 * @param {string} value
 * @returns {number}
 */
function one(value: string) {
	let count = 0;
	/** @type {number} */
	let index;
	/** @type {string} */
	let singular;
	/** @type {Array.<string>} */
	let parts;
	/** @type {ReturnType.<returnFactory>} */
	let addOne;
	/** @type {ReturnType.<returnFactory>} */
	let subtractOne;

	if (value.length === 0) {
		return count;
	}

	// Return early when possible.
	if (value.length < 3) {
		return 1;
	}

	// If `value` is a hard to count, it might be in `problematic`.
	if (own.call(problematic, value)) {
		return problematic[value];
	}

	// Additionally, the singular word might be in `problematic`.
	singular = pluralize(value, 1);

	if (own.call(problematic, singular)) {
		return problematic[singular];
	}

	addOne = returnFactory(1);
	subtractOne = returnFactory(-1);

	// Count some prefixes and suffixes, and remove their matched ranges.
	value = value.replace(EXPRESSION_TRIPLE, countFactory(3)).replace(EXPRESSION_DOUBLE, countFactory(2)).replace(EXPRESSION_SINGLE, countFactory(1));

	// Count multiple consonants.
	parts = value.split(/[^aeiouy]+/);
	index = -1;

	while (++index < parts.length) {
		if (parts[index] !== "") {
			count++;
		}
	}

	// Subtract one for occurrences which should be counted as one (but are
	// counted as two).
	value.replace(EXPRESSION_MONOSYLLABIC_ONE, subtractOne).replace(EXPRESSION_MONOSYLLABIC_TWO, subtractOne);

	// Add one for occurrences which should be counted as two (but are counted as
	// one).
	value
		.replace(EXPRESSION_DOUBLE_SYLLABIC_ONE, addOne)
		.replace(EXPRESSION_DOUBLE_SYLLABIC_TWO, addOne)
		.replace(EXPRESSION_DOUBLE_SYLLABIC_THREE, addOne)
		.replace(EXPRESSION_DOUBLE_SYLLABIC_FOUR, addOne);

	// Make sure at least on is returned.
	return count || 1;

	/**
	 * Define scoped counters, to be used in `String#replace()` calls.
	 * The scoped counter removes the matched value from the input.
	 *
	 * @param {number} addition
	 */
	function countFactory(addition: number) {
		return counter;
		/**
		 * @returns {string}
		 */
		function counter() {
			count += addition;
			return "";
		}
	}

	/**
	 * This scoped counter does not remove the matched value from the input.
	 *
	 * @param {number} addition
	 */
	function returnFactory(addition: number) {
		return returner;
		/**
		 * @param {string} $0
		 * @returns {string}
		 */
		function returner($0: string) {
			count += addition;
			return $0;
		}
	}
}
