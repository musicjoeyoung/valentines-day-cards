import { Hono } from "hono";
import { cors } from "hono/cors";
import { instrument } from "@fiberplane/hono-otel";
import messageRoutes from "./routes/message-routes";

type Bindings = {
  DATABASE_URL: string;
  AI: Ai;
  RESEND_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Welcome to the Valentines Day Cards API!");
});

app.use(cors());
app.route("/api/cards", messageRoutes);

export default instrument(app);
