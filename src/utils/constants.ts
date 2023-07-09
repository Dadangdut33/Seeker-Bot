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

export const md_session_cache_location = path.join(__dirname, "..", "..", ".MD_cache");

export const commands_dir = path.join(__dirname, "..", "commands");
export const events_dir = path.join(__dirname, "..", "events");
export const cmd_msg_dir = path.join(commands_dir, "message");
export const cmd_btn_dir = path.join(commands_dir, "button");
export const cmd_slash_dir = path.join(commands_dir, "slash");
