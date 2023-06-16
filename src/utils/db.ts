import mongoose, { Model, model } from "mongoose";
import { Guild } from "discord.js";
import { logColor } from "./helper";
import { GuildModel, AnySchema } from "../schemas";
import { GuildOption } from "../types";
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
export const getGuildOption = async (guild: Guild, option: GuildOption) => {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let foundGuild = await GuildModel.findOne({ guildID: guild.id });
	if (!foundGuild) return null;
	return foundGuild.options[option];
};

export const setGuildOption = async (guild: Guild, option: GuildOption, value: any) => {
	if (mongoose.connection.readyState === 0) throw new Error("Database not connected.");
	let foundGuild = await GuildModel.findOne({ guildID: guild.id });
	if (!foundGuild) return null;
	foundGuild.options[option] = value;
	foundGuild.save();
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
