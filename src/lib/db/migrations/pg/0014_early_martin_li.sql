CREATE TABLE "user_balance_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"balance_before" numeric(10, 2) NOT NULL,
	"balance_after" numeric(10, 2) NOT NULL,
	"type" varchar NOT NULL,
	"reason" text,
	"metadata" json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_balance_history" ADD CONSTRAINT "user_balance_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
