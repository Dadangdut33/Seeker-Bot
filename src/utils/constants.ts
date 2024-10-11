import path from "path";

export const CUSTOM_COLORS = {
	White: 0xffffff,
	Aqua: 0x1abc9c,
	Green: 0x2ecc71,
	Blue: 0x3498db,
	Yellow: 0xffff00,
	Purple: 0x9b59b6,
	LuminousVividPink: 0xe91e63,
	Fuchsia: 0xeb459e,
	Black: 0x000000,
};

export type consoleColorType = "text" | "variable" | "error" | "highlight" | "important" | "warning";
export const CONSOLE_COLORS = {
	text: "#ff8e4d",
	variable: "#ff624d",
	error: "#f5426c",
	highlight: "#ffff00",
	important: "0xffffff",
	warning: "#ff8e4d",
};

export const MD_SESSION_CACHE = path.join(__dirname, "..", "..", ".MD_cache");

export const EVENTS_DIR = path.join(__dirname, "..", "events");
export const CMD_DIR = path.join(__dirname, "..", "commands");
export const CMD_MSG_DIR = path.join(CMD_DIR, "message");
export const CMD_BTN_DIR = path.join(CMD_DIR, "button");
export const CMD_SLASH_DIR = path.join(CMD_DIR, "slash");

export const MAX_VARCHAR = 2048;
