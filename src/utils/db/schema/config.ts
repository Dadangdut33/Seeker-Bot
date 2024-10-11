import { env } from "@/env";
import { IGuildOptions } from "@/types";
import { MAX_VARCHAR } from "@/utils/constants";
import { InferSelectModel } from "drizzle-orm";
import { json, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const ServerConfig = pgTable("server_config", {
	guild_id: varchar("guild_id", { length: MAX_VARCHAR }).primaryKey(),
	options: json("options")
		.notNull()
		.default({
			prefix: env.PREFIX,
		})
		.$type<IGuildOptions>(),
	joined_at: timestamp("joined_at").notNull().defaultNow(),
});
export type ServerConfigType = InferSelectModel<typeof ServerConfig>;
