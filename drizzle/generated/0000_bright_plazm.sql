DO $$ BEGIN
 CREATE TYPE "public"."feed_type" AS ENUM('mal', 'crunchyroll', 'ann', 'nyaa');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_watch" (
	"guild_id" varchar(2048) PRIMARY KEY NOT NULL,
	"output_ch_nameid" varchar(2048) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_config" (
	"guild_id" varchar(2048) PRIMARY KEY NOT NULL,
	"options" json DEFAULT '{"prefix":"!!"}'::json NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "haiku_watch" (
	"guild_id" varchar(2048) NOT NULL,
	"author_id" varchar(2048) NOT NULL,
	"count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hall_of_fame" (
	"guild_id" varchar(2048) NOT NULL,
	"ch_id" varchar(2048) NOT NULL,
	"msg_id" varchar(2048) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "music_state" (
	"guild_id" varchar(2048) PRIMARY KEY NOT NULL,
	"tc_id" varchar(2048) NOT NULL,
	"vc_id" varchar(2048) NOT NULL,
	"queue" json[] DEFAULT '{}' NOT NULL,
	"last_active" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_spotlight" (
	"guild_id" varchar(2048) NOT NULL,
	"ch_id" varchar(2048) NOT NULL,
	"msg_id" varchar(2048) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feed" (
	"guild_id" varchar(2048) NOT NULL,
	"last_feed" varchar(2048) NOT NULL,
	"type" "feed_type" NOT NULL
);
