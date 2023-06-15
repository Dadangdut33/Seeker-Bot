import { Schema, model } from "mongoose";
import { IGuild } from "../types";

const AuditWatchSchema = new Schema<IGuild>({
	guildID: { required: true, type: String },
	options: {
		prefix: { type: String, default: process.env.PREFIX },
	},
});

const AuditWatchModel = model("auditwatch", AuditWatchSchema);

export default AuditWatchModel;
