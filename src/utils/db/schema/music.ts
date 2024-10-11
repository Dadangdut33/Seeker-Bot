import { IMusicQueue } from "@/types";
import { MAX_VARCHAR } from "@/utils/constants";
import { InferSelectModel } from "drizzle-orm";
import { varchar, json, pgTable, timestamp } from "drizzle-orm/pg-core";

export const MusicState = pgTable("music_state", {
	guild_id: varchar("guild_id", { length: MAX_VARCHAR }).primaryKey(), // only 1 music state per guild
	vc_id: varchar("tc_id", { length: MAX_VARCHAR }).notNull(),
	tc_id: varchar("vc_id", { length: MAX_VARCHAR }).notNull(),
	queue: json("queue").array().notNull().default([]).$type<IMusicQueue[]>(),
	last_active: timestamp("last_active").defaultNow(),
});
export type MusicStateType = InferSelectModel<typeof MusicState>;
