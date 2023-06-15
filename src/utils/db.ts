import mongoose from "mongoose";
import { Guild } from "discord.js";
import { logColor } from "./helper";
import GuildDB from "../schemas/Guild";
import { GuildOption } from "../types";
import { logger } from "../logger";

export const getGuildOption = async (guild: Guild, option: GuildOption) => {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let foundGuild = await GuildDB.findOne({ guildID: guild.id });
	if (!foundGuild) return null;
	return foundGuild.options[option];
};

export const setGuildOption = async (guild: Guild, option: GuildOption, value: any) => {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let foundGuild = await GuildDB.findOne({ guildID: guild.id });
	if (!foundGuild) return null;
	foundGuild.options[option] = value;
	foundGuild.save();
};

export async function connect_db() {
	const MONGO_URI = process.env.MONGO_URI;
	const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME;

	logger.info(`🍃 Connecting to MongoDB...`);
	await mongoose
		.connect(`${MONGO_URI}`, { dbName: MONGO_DATABASE_NAME })
		.then(() => logger.debug(`🍃 MongoDB connection has been ${logColor("variable", "established.")}`))
		.catch((e) => logger.error(`🍃 MongoDB connection has ${logColor("error", "failed.")} | Reason ${e}`));
}

export async function find_collection(collection: string, query: any) {
	return mongoose.connection.db.collection(collection).find(query);
}

export async function find_one_collection(collection: string, query: any) {
	return mongoose.connection.db.collection(collection).findOne(query);
}

export async function insert_collection(collection: string, doc: any) {
	return mongoose.connection.db.collection(collection).insertOne(doc);
}

export async function updateOne_Collection(collection: string, query: any, doc: any) {
	return mongoose.connection.db.collection(collection).updateOne(query, doc);
}

export async function updateMany_Collection(collection: string, query: any, doc: any) {
	return mongoose.connection.db.collection(collection).updateMany(query, doc);
}

export async function deleteOne_Collection(collection: string, query: any) {
	return mongoose.connection.db.collection(collection).deleteOne(query);
}
