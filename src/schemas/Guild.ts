import { Schema, model } from "mongoose";
import { IGuild } from "../types";

export const GuildSchema = new Schema<IGuild>(
	{
		guildID: { required: true, type: String },
		options: {
			prefix: { type: String, default: process.env.PREFIX },
		},
	},
	{ collection: "guilds" }
);

export const GuildModel = model("guilds", GuildSchema);
