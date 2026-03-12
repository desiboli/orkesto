CREATE TYPE "public"."message_role" AS ENUM('user', 'ASSISTANT');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('RESULT', 'ERROR');--> statement-breakpoint
CREATE TABLE "fragment" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"sandbox_url" text NOT NULL,
	"title" text NOT NULL,
	"files" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fragment_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"role" "message_role" NOT NULL,
	"type" "message_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fragment" ADD CONSTRAINT "fragment_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;