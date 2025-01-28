import { Filter } from "profanity-check"
import { Hono } from "hono";
import { cards } from "../db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Resend } from 'resend';

type Bindings = {
    DATABASE_URL: string;
    AI: any;
    RESEND_API_KEY: string;
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

// Custom profanity checker that uses a simple regex-based approach
function isProfane(text: string): boolean {
    // First check if the default filter finds any exact matches
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Only flag a word as profane if it exactly matches a profane word
    // This prevents flagging words like "class" or "assembly"
    return words.some(word => {
        // Skip common false positives
        const safeWords = new Set([
            'class', 'bass', 'brass', 'grass', 'mass', 'pass', 'assemble', 'assembly', 'crass',
            'assignment', 'field', 'assist', 'assign', 'assume', 'assassin', 'associate', 'association'
        ]);
        
        // Check if the word itself or any common variations are in the safe list
        if (safeWords.has(word) || Array.from(safeWords).some(safe => word.startsWith(safe))) {
            return false;
        }
        
        return defaultFilter.isProfane(word);
    });
}

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

        if (isProfane(to) || isProfane(from) || (message && isProfane(message))) {
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
        } else if (message.length > 300) {
            return c.json({ error: 'Custom messages cannot exceed 300 characters' }, 400);
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

        if (!c.env.RESEND_API_KEY) {
            return c.json({ error: 'Resend API key not found in environment' }, 500);
        }

        const resend = new Resend(c.env.RESEND_API_KEY);
        const body = await c.req.json();
        const { to, from, email, message: messageContent, messageType } = body as EmailRequest;

        if (!to || !from || !email || !messageContent) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        if (isProfane(to) || isProfane(from)) {
            return c.json({ error: "Profanity detected in input" }, 400);
        }

        try {
            console.log("Attempting to send email to:", email);
            const data = await resend.emails.send({
                from: 'Valentine Cards <onboarding@resend.dev>',
                to: email,
                subject: `Valentine's Day Card from ${from}`,
                html: `
                    <h1>You've received a Valentine's Day Card! 💝</h1>
                    <p>To: ${to}</p>
                    <p>From: ${from}</p>
                    <p>${messageContent}</p>
                    <p>Card Type: ${messageType}</p>
                `
            });
            console.log("Email sent successfully:", data);

            return c.json({
                success: true,
                message: 'Email sent successfully',
                data
            });
        } catch (emailError) {
            console.error('Error sending email through Resend:', {
                error: emailError,
                message: emailError instanceof Error ? emailError.message : 'Unknown error',
                stack: emailError instanceof Error ? emailError.stack : undefined
            });
            return c.json({
                success: false,
                error: emailError instanceof Error ? emailError.message : 'Failed to send email'
            }, 500);
        }
    } catch (error) {
        console.error('Error processing request:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process request'
        }, 500);
    }
});

export default message;