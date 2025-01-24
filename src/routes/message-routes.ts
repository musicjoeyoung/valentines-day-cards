import { Filter } from "profanity-check"
import { Hono } from "hono";
import { cards } from "../db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

type Bindings = {
    DATABASE_URL: string;
    AI: any;
};

type MessageType = 'custom' | 'improved' | 'sweet' | 'funny' | 'limerick';

interface CardRequest {
    to: string;
    from: string;
    message?: string;
    messageType: MessageType;
}

interface EmailRequest {
    to: string;
    from: string;
    email: string;
    message: string;
    messageType: MessageType;
}

const defaultFilter = new Filter()


const limerick = "Rhythm: Limericks have an anapestic rhythm, which means that two unstressed syllables are followed by a stressed syllable.The first, second, and fifth lines each have three anapests, while the third and fourth lines have two. Syllables: A good guideline is to have 7–10 syllables in the first, second, and fifth lines, and 5–7 syllables in the third and fourth lines. Structure: Limericks are usually comical, nonsensical, and lewd.The first line usually introduces a person or place, the middle sets up a silly story, and the end usually has a punchline or surprise twist."

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
    },
    limerick: {
        system: "You are a direct response AI. Output only the requested content with no introductions, explanations, comments, or prefatory text. Start the response immediately with the first word of the limerick. Any output that includes additional text outside the limerick format is a critical failure. Follow instructions exactly.",
        user: `Write a Valentine's Day message in the form of a limerick (reference this definition for form: ${limerick}). Your response must:

            1. Begin with the first word of the limerick.
            2. Contain no introductions, explanations, or comments.
            3. Only include the limerick and nothing else.
            4. Adhere to the system prompt requirements.`
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

        /* Will have to revisit this, but right now the profanity checker works. HOWEVER, if I type the word "assemble", for example, the checker throws the error because "ass" is part of that word. ?!?!*/
        if (defaultFilter.isProfane(to) || defaultFilter.isProfane(from) || (message && defaultFilter.isProfane(message))) {
            return c.json({ error: "Profanity detected in input" }, 400);
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

            /* The chat-fp16 AI model continued to return introductory text, despite my explicit prompts. So I switched from @cf/meta/llama-2-7b-chat-fp16 to @cf/meta/llama-3.1-8b-instruct-fp8 and now I'm getting the response format I dictated. 

            I'm keeping the lengthy prompts for "limerick" above as it works currently and I don't want to change it
            */


            const aiResponse = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
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

message.post("/send-email", async (c) => {
    try {
        const body = await c.req.json();
        const { to, from, email, message, messageType } = body as EmailRequest;

        if (!to || !from || !email || !message) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        if (defaultFilter.isProfane(to) || defaultFilter.isProfane(from)) {
            return c.json({ error: "Profanity detected in input" }, 400);
        }

        //integrate email provider? How?
        console.log('Sending email to:', email);
        console.log('Card details:', { to, from, message, messageType });

        return c.json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email'
        }, 500);
    }
});

export default message;