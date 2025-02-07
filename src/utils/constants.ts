const limerick = "Rhythm: Limericks have an anapestic rhythm, which means that two unstressed syllables are followed by a stressed syllable.The first, second, and fifth lines each have three anapests, while the third and fourth lines have two. Syllables: A good guideline is to have 7–10 syllables in the first, second, and fifth lines, and 5–7 syllables in the third and fourth lines. Structure: Limericks are usually comical, nonsensical, and lewd.The first line usually introduces a person or place, the middle sets up a silly story, and the end usually has a punchline or surprise twist."

export const PROMPTS = {
    improved: (message: string, { to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Only output the improved message with no additional text.",
        user: `Transform this Valentine's message into a more romantic version for ${to} from ${from}: "${message}"`
    }),
    sweet: ({ to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: `Create a sweet romantic Valentine's Day message for ${to} from ${from}.`
    }),
    funny: ({ to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: `Create a funny Valentine's Day message for ${to} from ${from}.`
    }),
    limerick: ({ to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Output only the requested content with no introductions, explanations, comments, or prefatory text. Start the response immediately with the first word of the limerick.",
        user: `Write a Valentine's Day message in the form of a limerick for ${to} from ${from}. Your response must:
            1. Begin with the first word of the limerick.
            2. Contain no introductions, explanations, or comments.
            3. Only include the limerick and nothing else.
            4. Adhere to the system prompt requirements.`
    }),
    flavorflav: ({ to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Only output the message with no additional text",
        user: `Create a Valentine's Day message in the style of Flavor Flav for ${to} from ${from}. Yeeeeah booooy!`
    }),
    rupaul: ({ to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: `Create a Valentine's Day message in the style of RuPaul for ${to} from ${from}.`
    }),
    deGrasseTyson: ({ to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Only output the message with no additional text",
        user: `Write a Valentine's Day message in the style of Neil deGrasse Tyson for ${to} from ${from}. Tear apart traditional messages with scientific facts, e.g., 'you're the missing piece of my heart' -> 'if your heart is missing a piece, you're dead, see a doctor'. Be funny, literal, and slightly grumpy. Be short, around 400 character-count max.`
    }),
    goose: ({ to, from }: { to: string; from: string }) => ({
        system: "You are a direct response AI. Only output the message with no additional text",
        user: `Write a Valentine's Day message in the style of a goose for ${to} from ${from}. Be excited, funny, and yell 'HONK!' often. By the way, do you have any bread? Be short, around 400 character-count max.`
    })
};
