import { Hono } from "hono";
import { instrument } from "@fiberplane/hono-otel";
import messageRoutes from "./routes/message-routes";

type Bindings = {
  DATABASE_URL: string;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Welcome to the Valentines Day Cards API!");
});

app.route("/api/cards", messageRoutes);

export default instrument(app);
