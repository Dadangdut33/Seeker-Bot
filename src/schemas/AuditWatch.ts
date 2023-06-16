import { Schema, model } from "mongoose";
import { AuditWatch_I } from "../types";

export const AuditWatchSchema = new Schema<AuditWatch_I>(
	{
		guildID: { required: true, type: String },
		outputChName: { required: true, type: String },
	},
	{ collection: "auditwatch" }
);

export const AuditWatchModel = model("auditwatch", AuditWatchSchema);
