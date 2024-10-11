import { MAX_VARCHAR } from "@/utils/constants";
import { type InferSelectModel } from "drizzle-orm";
import { pgTable, varchar, integer } from "drizzle-orm/pg-core";

export const HaikuWatch = pgTable("haiku_watch", {
	guild_id: varchar("guild_id", { length: MAX_VARCHAR }).notNull(), // many users per guild
	author_id: varchar("author_id", { length: MAX_VARCHAR }).notNull(),
	count: integer("count").notNull().default(1),
});

export type HaikuWatchType = InferSelectModel<typeof HaikuWatch>;
