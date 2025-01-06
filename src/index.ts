import { Hono } from "hono";
import { cards, type NewCard } from "./db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";

type Bindings = {
  DATABASE_URL: string;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Welcome to the Valentines Day Cards API!");
});

app.get("/api/cards", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return c.json({
    cards: await db.select().from(cards),
  });
});

app.post("/api/cards", async (c) => {
  try {
    const body = await c.req.json();
    const { to, from, message } = body as NewCard;

    if (!to || !from || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    await db.insert(cards).values({ to, from, message });

    return c.json({ message: 'Card created successfully', data: { to, from, message } });
  } catch (error) {
    return c.json({ error: 'Failed to create card' }, 500);
  }
});

export default instrument(app);
