import { createCard, emailCard, getCards } from "../controllers/message-controller";

import { Bindings } from "../types/types";
import { Hono } from "hono";

const message = new Hono<{ Bindings: Bindings }>();

message.get("/", getCards).post("/", createCard);

message.post("/send-email", emailCard);

export default message;