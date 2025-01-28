import { Hono } from "hono";
import { Bindings, MessageType } from "../types/types";
import { createCard, getCards, emailCard } from "../controllers/message-controller";

const message = new Hono<{ Bindings: Bindings }>();

message.get("/", getCards).post("/", createCard);

message.post("/send-email", emailCard);

export default message;