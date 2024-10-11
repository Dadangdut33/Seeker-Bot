import { MAX_VARCHAR } from "@/utils/constants";
import { InferSelectModel } from "drizzle-orm";
import { varchar, pgTable } from "drizzle-orm/pg-core";
import { FeedTypeEnum } from "./_enum";

export const Feed = pgTable("feed", {
	guild_id: varchar("guild_id", { length: MAX_VARCHAR }).notNull(), // can have multiple feeds per guild
	last_feed: varchar("last_feed", { length: MAX_VARCHAR }).notNull(),
	type: FeedTypeEnum("type").notNull(),
});
export type FeedType = InferSelectModel<typeof Feed>;
