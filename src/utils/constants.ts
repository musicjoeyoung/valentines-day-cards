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
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: "Create a Valentine's Day message in the style of Flavor Flav. Yeeeeah booooy!"
    },
    rupaul: {
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: "Create a Valentine's Day message in the style of RuPaul (from RuPaul's DragRace)."
    },
    tyson: {
        system: "You are a direct response AI. Only output the message with no additional text.",
        user: "Create a Valentine's Day message in the style of Neil deGrasse Tyson. That means: make fun of traditional Valentines Day messages, pointing out their shortcomings and how they're scientifically innacurate; his message should be tearing apart traditional Valentine's Day messages and interpreting them literally. For example, if a traditional message included 'you're the missing piece of my heart', Tyson would respond with an explanation that if a heart is missing a piece then your heart is not working, you're possibly dead, and you need to see a doctor. Another example, if a message included 'you are the sun in my sky', Tyson would respond with a scientific explanation of how the Sun is the center of the solar system. He should seem disgruntled with Valentine's Day messages but still make an effort to pull together a funny, literal, partially-grumpy, and scientific message."
    }
};