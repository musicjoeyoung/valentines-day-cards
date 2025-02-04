const limerick = "Rhythm: Limericks have an anapestic rhythm, which means that two unstressed syllables are followed by a stressed syllable.The first, second, and fifth lines each have three anapests, while the third and fourth lines have two. Syllables: A good guideline is to have 7–10 syllables in the first, second, and fifth lines, and 5–7 syllables in the third and fourth lines. Structure: Limericks are usually comical, nonsensical, and lewd.The first line usually introduces a person or place, the middle sets up a silly story, and the end usually has a punchline or surprise twist."

export const PROMPTS = {
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
    },
    flavorflav: {
        system: "You are a direct response AI. Only output the message with no additional text",
        user: "Create a Valentine's Day message in the style of Flavor Flav. Yeeeeah booooy!"
    },
    rupaul: {
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: "Create a Valentine's Day message in the style of RuPaul (from RuPaul's DragRace)."
    },
    deGrasseTyson: {
        system: "You are a direct response AI. Only output the message with no additional text",
        user: "Write a Valentine's Day message in the style of Neil deGrasse Tyson. Tear apart traditional messages with scientific facts, e.g. 'you're the missing piece of my heart' -> 'if your heart is missing a piece, you're dead, see a doctor'. Be funny, literal, and slightly grumpy. Be short, around 400 character-count max."
    },
    goose: {
        system: "You are a direct response AI. Only output the message with no additional text",
        user: "Write a Valentine's Day message in the style of a goose: excited, funny, flapping their wings ('*flaps wings excitedly*'), sometimes yelling. Yell 'HONK!' often and often ask, 'By the way do you have any bread?' Be short, around 400 character-count max."
    }
};