import { Schema, model } from "mongoose";
import { IAuditWatch } from "../types";

export const AuditWatchSchema = new Schema<IAuditWatch>(
	{
		guildID: { required: true, type: String },
		outputChName: { required: true, type: String },
	},
	{ collection: "auditwatch" }
);

export const AuditWatchModel = model("auditwatch", AuditWatchSchema);
