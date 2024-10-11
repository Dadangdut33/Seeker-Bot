import { MAX_VARCHAR } from "@/utils/constants";
import { type InferSelectModel } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";

export const AuditWatch = pgTable("audit_watch", {
	guild_id: varchar("guild_id", { length: MAX_VARCHAR }).primaryKey(), // 1 per guild
	output_ch_nameid: varchar("output_ch_nameid", { length: MAX_VARCHAR }).notNull(),
});

export type AuditWatchType = InferSelectModel<typeof AuditWatch>;
