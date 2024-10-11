import { MAX_VARCHAR } from "@/utils/constants";
import { InferSelectModel } from "drizzle-orm";
import { varchar, pgTable, timestamp } from "drizzle-orm/pg-core";

export const MessageSpotlight = pgTable("message_spotlight", {
	guild_id: varchar("guild_id", { length: MAX_VARCHAR }).notNull(),
	ch_id: varchar("ch_id", { length: MAX_VARCHAR }).notNull(),
	msg_id: varchar("msg_id", { length: MAX_VARCHAR }).notNull(),
	created_at: timestamp("created_at").defaultNow(),
});
export type MessageSpotlightType = InferSelectModel<typeof MessageSpotlight>;
