import mongoose from "mongoose";
import { color } from "./functions";

interface anyInterface extends mongoose.Document {
	[key: string]: any;
}

export async function connect_db() {
	const MONGO_URI = process.env.MONGO_URI;
	const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME;

	console.log(color("text", `🍃 Connecting to MongoDB...`));
	await mongoose
		.connect(`${MONGO_URI}`, { dbName: MONGO_DATABASE_NAME })
		.then(() => console.log(color("text", `🍃 MongoDB connection has been ${color("variable", "established.")}`)))
		.catch(() => console.log(color("text", `🍃 MongoDB connection has been ${color("error", "failed.")}`)));
}

export function find_DB_CB(collection: string, query: any, cb: any) {
	// @ts-ignore
	mongoose.connection.db.collection(collection, function (err: any, collection: any) {
		collection.find(query).toArray(cb);
	});
}

export function find_DB_Return(tablename: string, query: any): Promise<anyInterface[]> {
	return new Promise((resolve, reject) => {
		// @ts-ignore
		mongoose.connection.db.collection(tablename, function (err: any, collection: any) {
			collection.find(query).toArray(function (err: any, result: any) {
				if (err) reject(err);
				resolve(result);
			});
		});
	});
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
