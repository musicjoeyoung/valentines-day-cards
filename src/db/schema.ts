import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NewCard = typeof cards.$inferInsert;

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  to: text("to"),
  from: text("from"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
