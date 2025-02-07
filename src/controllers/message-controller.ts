import { Context } from "hono";
import { MessageType } from "../types/types";
import { PROMPTS } from "../utils/constants";
import { Resend } from 'resend';
import { cards } from "../db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { isProfane } from "../utils/profanity-checker";
import { neon } from "@neondatabase/serverless";

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

export const getCards = async (c: Context) => {
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
}

export const createCard = async (c: Context) => {
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
            const prompt =
                messageType === 'improved'
                    ? PROMPTS.improved(message || '', { to, from })
                    : PROMPTS[messageType]({ to, from });

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
}

export const emailCard = async (c: Context) => {
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
        //test
        try {
            console.log("Attempting to send email to:", email);
            const data = await resend.emails.send({
                from: 'Valentine Cards <josephmyoung@josephmyoung.com>',
                to: email,
                subject: `Valentine's Day Card from ${from}`,
                html: `
                    <h1>You've received a Valentine's Day Card! 💝</h1>
                    <p>${messageContent}</p>
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
}