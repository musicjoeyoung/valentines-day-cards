import { Hono } from "hono";
import { cards } from "../db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

type Bindings = {
    DATABASE_URL: string;
    AI: any;
};

type MessageType = 'custom' | 'improved' | 'sweet' | 'funny';

interface CardRequest {
    to: string;
    from: string;
    message?: string;
    messageType: MessageType;
}

const PROMPTS = {
    improved: (message: string) => ({
        system: "You are a direct response AI. Only output the improved message with no additional text.",
        user: `Transform this Valentine's message into a more romantic version: "${message}"`
    }),
    sweet: {
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: "Create a sweet romantic Valentine's Day message"
    },
    funny: {
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: "Create a funny Valentine's Day message"
    }
};

const message = new Hono<{ Bindings: Bindings }>();

message.get("/", async (c) => {
    try {

        const sql = neon(c.env.DATABASE_URL);
        const db = drizzle(sql);

        return c.json({
            cards: await db.select().from(cards),
        });
    } catch (error) {
        console.error('Error:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get cards'
        }, 500);
    }
});

message.post("/", async (c) => {
    try {
        const body = await c.req.json();
        const { to, from, message, messageType } = body as CardRequest;

        if (!to || !from || !messageType) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        let finalMessage = message;

        // different message types
        if (messageType !== 'custom') {
            const prompt = messageType === 'improved'
                ? PROMPTS.improved(message || '')
                : PROMPTS[messageType];

            if (messageType === 'improved' && !message) {
                return c.json({ error: 'Original message required for improvement' }, 400);
            }

            const aiResponse = await c.env.AI.run('@cf/meta/llama-2-7b-chat-fp16', {
                messages: [
                    { role: 'system', content: prompt.system },
                    { role: 'user', content: prompt.user }
                ],
                stream: false,
                temperature: 0.7,
                max_tokens: 150,
            });

            finalMessage = aiResponse.response.trim();
        } else if (!message) {
            return c.json({ error: 'Message required for custom type' }, 400);
        }

        const sql = neon(c.env.DATABASE_URL);
        const db = drizzle(sql);

        await db.insert(cards).values({
            to,
            from,
            message: finalMessage,
            messageType
        });

        return c.json({
            success: true,
            data: {
                to,
                from,
                message: finalMessage,
                messageType
            }
        });

    } catch (error) {
        console.error('Error:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create card'
        }, 500);
    }
});


export default message;