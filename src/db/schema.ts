import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { pgEnum as drizzlePgEnum } from "drizzle-orm/pg-core";

export type NewCard = typeof cards.$inferInsert;
export const messageTypeEnum = drizzlePgEnum('message_type', ['custom', 'improved', 'sweet', 'funny', 'limerick', 'flavorflav', 'rupaul', 'deGrasseTyson', 'goose']);
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  to: text("to"),
  from: text("from"),
  message: text("message"),
  messageType: messageTypeEnum("message_type").notNull().default('custom'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

