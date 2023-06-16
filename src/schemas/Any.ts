import { Schema } from "mongoose";

export const AnySchema = new Schema({}, { strict: false });

// Any schema to be used for queries that don't have a schema
