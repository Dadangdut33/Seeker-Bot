import mongoose, { Model, model } from "mongoose";
import { Client, Guild } from "discord.js";
import { logColor } from "./helper";
import { GuildModel, AnySchema } from "../schemas";
import { IGuild, TGuildOption } from "../types";
import { logger } from "../logger";

// ------------------ Connecting to DB ------------------ //
export async function connect_db() {
	const MONGO_URI = process.env.MONGO_URI;
	const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME;

	logger.info(`🍃 Connecting to MongoDB...`);
	await mongoose
		.connect(`${MONGO_URI}`, { dbName: MONGO_DATABASE_NAME })
		.then(() => logger.debug(`🍃 MongoDB connection has been ${logColor("variable", "established.")}`))
		.catch((e) => logger.error(`🍃 MongoDB connection has ${logColor("error", "failed.")} | Reason ${e}`));
}

// ------------------ Guild Collection Helper ------------------ //
/**
 * @description
 * This function is used to get a guild option from the database.
 * It will first check if guild is in local config, if not check db, if not on both we store it in db
 * @param client
 * @param guild
 * @param option
 * @returns
 */
export const getGuildOption = async (client: Client, guild: Guild, option: TGuildOption) => {
	let foundGuild = client.guildPreferences.get(guild.id); // get from local config
	if (!foundGuild) foundGuild = (await GuildModel.findOne({ guildID: guild.id })) as IGuild; // get from db
	if (foundGuild) return foundGuild.options[option]; // return if found

	// Create new guild if not found
	const joinedAt = client.guilds.cache.get(guild.id)?.joinedAt || new Date();
	const newGuild = new GuildModel({
		guildID: guild.id,
		options: {
			prefix: process.env.PREFIX,
		},
		joinedAt,
	});
	newGuild.save(); // save to db
	client.guildPreferences.set(guild.id, newGuild); // save to local config
	return newGuild.options[option];
};

export const setGuildOption = async (client: Client, guild: Guild, option: TGuildOption, value: any) => {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let foundGuild = await GuildModel.findOne({ guildID: guild.id });
	if (foundGuild) {
		foundGuild.options[option] = value;
		foundGuild.save(); // update db
		client.guildPreferences.set(guild.id, foundGuild); // update local config
		return;
	}

	// Create new guild if not found
	const joinedAt = client.guilds.cache.get(guild.id)?.joinedAt || new Date();
	const newGuild = new GuildModel({
		guildID: guild.id,
		options: {
			prefix: process.env.PREFIX,
		},
		joinedAt,
	});
	newGuild.options[option] = value;
	newGuild.save(); // save to db
	client.guildPreferences.set(guild.id, newGuild); // save to local config
};

// ------------------ Query Helper Using Model Object ------------------ //
// Need to pass the model object to the function

export async function find_model(the_model: Model<any>, query: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	return the_model.find(query);
}

export async function find_one_model(the_model: Model<any>, query: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	return the_model.findOne(query);
}

export async function insert_model(the_model: Model<any>, doc: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	return the_model.create(doc);
}

export async function updateOne_model(the_model: Model<any>, query: any, doc: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	return the_model.updateOne(query, doc);
}

export async function updateMany_model(the_model: Model<any>, query: any, doc: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	return the_model.updateMany(query, doc);
}

export async function deleteOne_model(the_model: Model<any>, query: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	return the_model.deleteOne(query);
}

// ------------------ Query Helper Using only the collection name ------------------ //
// It uses try catch to bypass overwritemodelerror
// how it works is that if a model is already defined, it will use that model hence the try catch

export async function find_colname(collection: string, query: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let res;
	try {
		res = model(collection, AnySchema, collection).find(query);
	} catch (e) {
		res = model(collection).find(query);
	} finally {
		return res;
	}
}

export async function find_one_colname(collection: string, query: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let res;
	try {
		res = model(collection, AnySchema, collection).findOne(query);
	} catch (e) {
		res = model(collection).find(query);
	} finally {
		return res;
	}
}

export async function insert_colname(collection: string, doc: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let res;
	try {
		res = model(collection, AnySchema, collection).create(doc);
	} catch (e) {
		res = model(collection).create(doc);
	} finally {
		return res;
	}
}

export async function updateOne_colname(collection: string, query: any, doc: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let res;
	try {
		res = model(collection, AnySchema, collection).updateOne(query, doc);
	} catch (e) {
		res = model(collection).updateOne(query, doc);
	} finally {
		return res;
	}
}

export async function updateMany_colname(collection: string, query: any, doc: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let res;
	try {
		res = model(collection, AnySchema, collection).updateMany(query, doc);
	} catch (e) {
		res = model(collection).updateMany(query, doc);
	} finally {
		return res;
	}
}

export async function deleteOne_colname(collection: string, query: any) {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let res;
	try {
		res = model(collection, AnySchema, collection).deleteOne(query);
	} catch (e) {
		res = model(collection).deleteOne(query);
	} finally {
		return res;
	}
}
