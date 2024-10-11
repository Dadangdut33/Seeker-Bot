import { pgEnum } from "drizzle-orm/pg-core";

export const FeedOption = ["mal", "crunchyroll", "ann", "nyaa"] as const;
export type FeedEnumType = (typeof FeedOption)[number];
export const FeedTypeEnum = pgEnum("feed_type", FeedOption);
